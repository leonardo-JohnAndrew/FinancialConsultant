import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// ── XML CELL HELPERS ─────────────────────────────────────────────────────────
function escXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Sets a cell's value directly in raw sheet XML, preserving existing
 * style ("s=...") attributes. Works for cells that already exist in the
 * template (which is the case for a pre-built form like this).
 */
function setCellValue(sheetXml, cellRef, value, { isString = false } = {}) {
  const cellRegex = new RegExp(
    `<c r="${cellRef}"([^>]*?)(/>|>([\\s\\S]*?)</c>)`,
  );
  const match = sheetXml.match(cellRegex);

  if (!match) {
    console.warn(`Cell ${cellRef} not found in template — skipping`);
    return sheetXml;
  }

  // Preserve existing attributes (like style s="12") but strip old t="..."
  let attrs = match[1].replace(/\s*t="[^"]*"/, "");

  const isEmpty = value === "" || value === null || value === undefined;

  if (isEmpty) {
    return sheetXml.replace(cellRegex, `<c r="${cellRef}"${attrs}/>`);
  }

  if (isString) {
    const inner = `<is><t xml:space="preserve">${escXml(value)}</t></is>`;
    return sheetXml.replace(
      cellRegex,
      `<c r="${cellRef}"${attrs} t="inlineStr">${inner}</c>`,
    );
  }

  // numeric
  const inner = `<v>${escXml(value)}</v>`;
  return sheetXml.replace(cellRegex, `<c r="${cellRef}"${attrs}>${inner}</c>`);
}

// ── TIN DIGIT LAYOUT ─────────────────────────────────────────────────────────
// Row 17 cols: N O P Q(-) R S T U(-) V W X Y(-) Z AA AB AC AD
const TIN_COLS = [
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "AA",
  "AB",
  "AC",
  "AD",
];

function fillTIN(sheetXml, row, tinStr) {
  const chars = (tinStr || "").padEnd(17, " ").split("");
  chars.forEach((ch, i) => {
    const cellRef = `${TIN_COLS[i]}${row}`;
    const val = ch === "-" ? "-" : ch.trim() === "" ? "" : ch;
    sheetXml = setCellValue(sheetXml, cellRef, val, { isString: true });
  });
  return sheetXml;
}

// ── IMAGE EMBEDDING HELPERS ──────────────────────────────────────────────────
// AdmZip works directly on the raw .xlsx (which is a zip of OOXML parts), so
// to embed an image we have to manually create the drawing parts that Excel
// expects: the media file itself, a drawing XML that positions it, the
// relationship files that connect sheet ↔ drawing ↔ image, and register the
// new parts in [Content_Types].xml.

const EMU_PER_PX = 9525; // standard 96 DPI conversion used by OOXML drawings

function colLetterToIndex(col) {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx - 1; // zero-based, as required by drawingml
}

function parseCellRef(cellRef) {
  const m = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!m) throw new Error(`Invalid cell reference: ${cellRef}`);
  return { col: colLetterToIndex(m[1]), row: parseInt(m[2], 10) - 1 };
}

function getNextIndex(zip, regex) {
  const nums = zip
    .getEntries()
    .map((e) => e.entryName.match(regex))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

/**
 * Registers an image file extension in [Content_Types].xml if it isn't
 * declared yet (needed regardless of which drawing part the image lands in).
 */
function ensureImageContentType(zip, imageExt) {
  const ctPath = "[Content_Types].xml";
  let ctXml = zip.getEntry(ctPath).getData().toString("utf8");
  const extLower = imageExt.toLowerCase();
  if (new RegExp(`Extension="${extLower}"`).test(ctXml)) return;
  const extContentType =
    extLower === "jpg" || extLower === "jpeg"
      ? "image/jpeg"
      : `image/${extLower}`;
  ctXml = ctXml.replace(
    "</Types>",
    `<Default Extension="${extLower}" ContentType="${extContentType}"/></Types>`,
  );
  zip.updateFile(ctPath, Buffer.from(ctXml, "utf8"));
}

/**
 * Embeds an image into a worksheet as a FLOATING picture of fixed size,
 * anchored to the top-left corner of a given cell (does not stretch/distort
 * with merged cells or column widths).
 *
 * IMPORTANT: a worksheet can only have ONE <drawing> reference — it is not
 * repeatable in the OOXML schema. Many real-world templates (like this BIR
 * form) already ship with a drawing part for their logo/header images. If we
 * blindly created a second drawing part and tried to link it, a guard
 * against duplicate <drawing> tags would skip the link step — silently
 * orphaning our new part so the image never renders (this is exactly what
 * was happening). This function instead detects an existing drawing on the
 * sheet and, if found, appends our picture into THAT drawing's XML/rels
 * rather than creating a disconnected new one.
 *
 * Call this AFTER any zip.updateFile(sheetPath, ...) calls that write cell
 * values, so it reads the up-to-date sheet XML.
 *
 * anchorCell: top-left cell the image floats from, e.g. "A66"
 * widthPx / heightPx: fixed rendered size of the image
 * offsetXPx / offsetYPx: nudge right/down from that cell's top-left corner
 */
function embedImageInSheet(
  zip,
  sheetPath,
  {
    imageBuffer,
    imageExt,
    anchorCell,
    widthPx,
    heightPx,
    offsetXPx = 0,
    offsetYPx = 0,
  },
) {
  ensureImageContentType(zip, imageExt);

  const { col, row } = parseCellRef(anchorCell);
  const cx = Math.round(widthPx * EMU_PER_PX);
  const cy = Math.round(heightPx * EMU_PER_PX);
  const colOff = Math.round(offsetXPx * EMU_PER_PX);
  const rowOff = Math.round(offsetYPx * EMU_PER_PX);

  const imgIndex = getNextIndex(zip, /^xl\/media\/image(\d+)\./);
  const mediaName = `image${imgIndex}.${imageExt}`;
  const mediaPath = `xl/media/${mediaName}`;
  zip.addFile(mediaPath, imageBuffer);

  const buildPicXml = (relId, nvId) => `<xdr:oneCellAnchor>
      <xdr:from><xdr:col>${col}</xdr:col><xdr:colOff>${colOff}</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>${rowOff}</xdr:rowOff></xdr:from>
      <xdr:ext cx="${cx}" cy="${cy}"/>
      <xdr:pic>
        <xdr:nvPicPr>
          <xdr:cNvPr id="${nvId}" name="Signature${imgIndex}"/>
          <xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr>
        </xdr:nvPicPr>
        <xdr:blipFill>
          <a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relId}"/>
          <a:stretch><a:fillRect/></a:stretch>
        </xdr:blipFill>
        <xdr:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </xdr:spPr>
      </xdr:pic>
      <xdr:clientData/>
    </xdr:oneCellAnchor>`;

  const sheetName = path.basename(sheetPath, ".xml");
  const sheetRelsPath = `xl/worksheets/_rels/${sheetName}.xml.rels`;
  const sheetRelsEntry = zip.getEntry(sheetRelsPath);

  // Look for a drawing relationship this sheet already uses
  let existingDrawingPath = null;
  if (sheetRelsEntry) {
    const relsXml = sheetRelsEntry.getData().toString("utf8");
    const drawingRelMatch = relsXml.match(
      /<Relationship[^>]*Type="[^"]*\/drawing"[^>]*Target="([^"]+)"/,
    );
    if (drawingRelMatch) {
      existingDrawingPath = path
        .normalize(path.join("xl/worksheets", drawingRelMatch[1]))
        .replace(/\\/g, "/");
    }
  }

  if (existingDrawingPath && zip.getEntry(existingDrawingPath)) {
    // ── APPEND into the sheet's existing drawing part ──────────────────
    const drawingRelsPath = existingDrawingPath
      .replace("xl/drawings/", "xl/drawings/_rels/")
      .replace(/\.xml$/, ".xml.rels");

    let relId;
    const existingDrawingRelsEntry = zip.getEntry(drawingRelsPath);
    if (existingDrawingRelsEntry) {
      let relsXml = existingDrawingRelsEntry.getData().toString("utf8");
      const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((m) =>
        parseInt(m[1], 10),
      );
      relId = `rId${ids.length ? Math.max(...ids) + 1 : 1}`;
      const newRel = `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>`;
      relsXml = relsXml.replace(
        "</Relationships>",
        `${newRel}</Relationships>`,
      );
      zip.updateFile(drawingRelsPath, Buffer.from(relsXml, "utf8"));
    } else {
      relId = "rId1";
      const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>
</Relationships>`;
      zip.addFile(drawingRelsPath, Buffer.from(relsXml, "utf8"));
    }

    let drawingXml = zip
      .getEntry(existingDrawingPath)
      .getData()
      .toString("utf8");
    const usedIds = (drawingXml.match(/ id="(\d+)"/g) || []).map((s) =>
      parseInt(s.match(/\d+/)[0], 10),
    );
    const nvId = (usedIds.length ? Math.max(...usedIds) : 0) + 1;
    drawingXml = drawingXml.replace(
      "</xdr:wsDr>",
      `${buildPicXml(relId, nvId)}</xdr:wsDr>`,
    );
    zip.updateFile(existingDrawingPath, Buffer.from(drawingXml, "utf8"));
    return;
  }

  // ── No existing drawing on this sheet — create a new one from scratch ──
  const drawingIndex = getNextIndex(zip, /^xl\/drawings\/drawing(\d+)\.xml$/);
  const drawingPath = `xl/drawings/drawing${drawingIndex}.xml`;
  const drawingRelsPath = `xl/drawings/_rels/drawing${drawingIndex}.xml.rels`;
  const relId = "rId1";

  const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${buildPicXml(relId, 2)}</xdr:wsDr>`;
  zip.addFile(drawingPath, Buffer.from(drawingXml, "utf8"));

  const drawingRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>
</Relationships>`;
  zip.addFile(drawingRelsPath, Buffer.from(drawingRelsXml, "utf8"));

  let newSheetRelId;
  if (sheetRelsEntry) {
    let relsXml = sheetRelsEntry.getData().toString("utf8");
    const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((m) =>
      parseInt(m[1], 10),
    );
    newSheetRelId = `rId${ids.length ? Math.max(...ids) + 1 : 1}`;
    const newRel = `<Relationship Id="${newSheetRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingIndex}.xml"/>`;
    relsXml = relsXml.replace("</Relationships>", `${newRel}</Relationships>`);
    zip.updateFile(sheetRelsPath, Buffer.from(relsXml, "utf8"));
  } else {
    newSheetRelId = "rId1";
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="${newSheetRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingIndex}.xml"/>
</Relationships>`;
    zip.addFile(sheetRelsPath, Buffer.from(relsXml, "utf8"));
  }

  let sheetXml = zip.getEntry(sheetPath).getData().toString("utf8");
  if (!sheetXml.includes("xmlns:r=")) {
    sheetXml = sheetXml.replace(
      "<worksheet ",
      '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ',
    );
  }
  // <drawing> has a strict required position in the CT_Worksheet schema —
  // it must come BEFORE <legacyDrawing>, <picture>, <tableParts>, <extLst>
  // if present. Blindly appending before </worksheet> when one of those
  // trailing elements exists produces an invalid file that Excel silently
  // "repairs" by stripping the drawing.
  const trailingTagMatch = sheetXml.match(
    /<(legacyDrawing|legacyDrawingHF|picture|oleObjects|controls|webPublishItems|tableParts|extLst)[ >]/,
  );
  if (trailingTagMatch) {
    const idx = trailingTagMatch.index;
    sheetXml =
      sheetXml.slice(0, idx) +
      `<drawing r:id="${newSheetRelId}"/>` +
      sheetXml.slice(idx);
  } else {
    sheetXml = sheetXml.replace(
      "</worksheet>",
      `<drawing r:id="${newSheetRelId}"/></worksheet>`,
    );
  }
  zip.updateFile(sheetPath, Buffer.from(sheetXml, "utf8"));
}

// ── ROUTE ─────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      quarter,
      supplier,
      atcCode,
      atcDescription,
      taxRate,
      month1,
      month2,
      month3,
      chiefAccountantSign,
    } = body;

    if (!quarter?.from || !quarter?.to) {
      return NextResponse.json(
        { error_message: "Missing quarter.from or quarter.to in request body" },
        { status: 400 },
      );
    }
    if (!supplier) {
      return NextResponse.json(
        { error_message: "Missing supplier object in request body" },
        { status: 400 },
      );
    }

    const m1 = Number(month1) || 0;
    const m2 = Number(month2) || 0;
    const m3 = Number(month3) || 0;

    const templatePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "bir logo",
      "birform.xlsx",
    );

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error_message: `Template file not found at: ${templatePath}` },
        { status: 500 },
      );
    }

    const zip = new AdmZip(templatePath);

    // Confirm the correct worksheet XML filename.
    // Most single-sheet templates use "sheet1.xml" — adjust if yours differs
    // (check console output below on first run).
    const sheetPath = "xl/worksheets/sheet1.xml";
    const entry = zip.getEntry(sheetPath);

    if (!entry) {
      const allEntries = zip.getEntries().map((e) => e.entryName);
      return NextResponse.json(
        {
          error_message: `${sheetPath} not found in template.`,
          available_entries: allEntries,
        },
        { status: 500 },
      );
    }

    let sheetXml = entry.getData().toString("utf8");

    // ══════════════════════════════════════════════════════════════════════
    // 1. PERIOD (row 13)
    // ══════════════════════════════════════════════════════════════════════
    const parseDate = (mmddyyyy) => {
      const [mm, dd, yyyy] = (mmddyyyy || "").split("/");
      return yyyy && mm && dd ? `${mm}${dd}${yyyy}` : "";
    };

    const fromDate = parseDate(quarter.from);
    const toDate = parseDate(quarter.to);

    const fromCell = ["J", "K", "L", "M", "N", "O", "P", "Q"];
    const toCell = ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH"];
    const extractedFrom = fromDate.split("");
    const extractedTo = toDate.split("");

    fromCell.forEach((l, i) => {
      sheetXml = setCellValue(sheetXml, `${l}13`, extractedFrom[i], {
        isString: true,
      });
    });
    toCell.forEach((l, i) => {
      sheetXml = setCellValue(sheetXml, `${l}13`, extractedTo[i], {
        isString: true,
      });
    });

    // ══════════════════════════════════════════════════════════════════════
    // 2. PAYEE TIN (row 17)
    // ══════════════════════════════════════════════════════════════════════
    sheetXml = fillTIN(sheetXml, 17, supplier.supplierTin || "");

    // ══════════════════════════════════════════════════════════════════════
    // 3. PAYEE NAME (B19)
    // ══════════════════════════════════════════════════════════════════════
    sheetXml = setCellValue(sheetXml, "B19", supplier.supplierName || "", {
      isString: true,
    });
    sheetXml = setCellValue(sheetXml, "AQ19", "", { isString: true });

    // ══════════════════════════════════════════════════════════════════════
    // 4. PAYEE ADDRESS (B23) + ZIP (AK24–AN24)
    // ══════════════════════════════════════════════════════════════════════
    sheetXml = setCellValue(sheetXml, "B23", supplier.supplierAddress || "", {
      isString: true,
    });
    sheetXml = setCellValue(sheetXml, "AQ23", "", { isString: true });

    const zipDigits = (supplier.zipCode || "").padEnd(4, " ");
    ["AK24", "AL24", "AM24", "AN24"].forEach((cellRef, i) => {
      sheetXml = setCellValue(sheetXml, cellRef, zipDigits[i].trim() || "", {
        isString: true,
      });
    });

    // ══════════════════════════════════════════════════════════════════════
    // 6. ATC CODE (L47) + DESCRIPTION (A47)
    // ══════════════════════════════════════════════════════════════════════
    sheetXml = setCellValue(sheetXml, "L47", atcCode || "", { isString: true });
    sheetXml = setCellValue(sheetXml, "A47", atcDescription || "", {
      isString: true,
    });

    // ══════════════════════════════════════════════════════════════════════
    // 7. AMOUNTS (row 47) — numeric, formulas AD47/AI47 stay untouched
    // ══════════════════════════════════════════════════════════════════════
    sheetXml = setCellValue(sheetXml, "O47", m1);
    sheetXml = setCellValue(sheetXml, "T47", m2);
    sheetXml = setCellValue(sheetXml, "Y47", m3);
    sheetXml = setCellValue(sheetXml, "AQ47", Number(taxRate) || 0);

    // ── Write modified sheet XML back into the zip, leave everything else ──
    zip.updateFile(sheetPath, Buffer.from(sheetXml, "utf8"));

    // ══════════════════════════════════════════════════════════════════════
    // 8. E-SIGNATURE IMAGE — floating, fixed size, sits above "ELSA G.
    //    OCRETO" in the Payor Signature Block.
    // ══════════════════════════════════════════════════════════════════════
    // chiefAccountantSign turned out to be a relative path under /public,
    // e.g. "/uploads/signatures/1781165900375-photo_....jpg" — NOT a base64
    // data URL. Read it straight from disk.
    //
    // anchorCell "K67" targets the blank gap row directly above "ELSA G.
    // OCRETO" (row 68), roughly centered under the printed name. Nudge
    // col letter left/right to re-center, and heightPx down if it overlaps
    // the name text below it.
    // anchorCell "Q67" + offsetXPx 6 horizontally centers a 150px-wide
    // image under the full A:AO merged name block. heightPx is capped at 13
    // because row 67 (the only blank space above "ELSA G. OCRETO") is only
    // ~13-14px tall — the name/title text is bottom-aligned within the
    // A67:AO69 merged cell, so anything taller here spills onto the name.
    if (chiefAccountantSign && typeof chiefAccountantSign === "string") {
      const relPath = chiefAccountantSign.replace(/^\/+/, ""); // strip leading slash(es)
      const signaturePath = path.join(process.cwd(), "public", relPath);

      if (fs.existsSync(signaturePath)) {
        const imageBuffer = fs.readFileSync(signaturePath);
        const ext = path.extname(signaturePath).slice(1).toLowerCase();
        const imageExt = ext === "jpeg" ? "jpg" : ext || "png";

        embedImageInSheet(zip, sheetPath, {
          imageBuffer,
          imageExt,
          anchorCell: "Q67",
          widthPx: 150,
          heightPx: 13,
          offsetXPx: 6,
          offsetYPx: 0,
        });
      } else {
        console.warn(`Signature file not found at: ${signaturePath}`);
      }
    } else {
      console.warn(
        "No chiefAccountantSign provided — skipping signature embed",
      );
    }

    // Force Excel to recalculate formulas (AD47, AI47) on open, since we
    // bypassed ExcelJS which normally handles this
    const workbookXmlEntry = zip.getEntry("xl/workbook.xml");
    if (workbookXmlEntry) {
      let workbookXml = workbookXmlEntry.getData().toString("utf8");
      if (!workbookXml.includes("<calcPr")) {
        workbookXml = workbookXml.replace(
          "</workbook>",
          `<calcPr fullCalcOnLoad="1"/></workbook>`,
        );
        zip.updateFile("xl/workbook.xml", Buffer.from(workbookXml, "utf8"));
      }
    }

    const buffer = zip.toBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="BIR2307_${supplier.supplierName || "export"}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("BIR2307 Error:", error.message, error.stack);
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}
