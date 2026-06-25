/**
 * lib/summaryExport.js
 *
 * Fills /public/uploads/summary.xlsx with cashbook + sub-entry data.
 * Layout ng template ay HINDI binabago — values lang ang ilalagay.
 *
 * npm install exceljs adm-zip
 */
"use server";
import ExcelJS from "exceljs";
import path from "path";
import { Summary } from "@/db/models";
const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "summary.xlsx",
);

// ─── Sheet resolver ──────────────────────────────────────────────────────────

function getSheetName(currency, category) {
  const cur = (currency || "").toUpperCase();
  const cat = (category || "").toLowerCase();

  if (cur === "PH" && cat === "bank") return "CashBook (PSbank)";
  if (cur === "PH" && cat === "cash") return "CashBook (PScash)";
  if (cur === "US" && cat === "bank") return "CashBook (US$bank)";
  if (cur === "US" && cat === "cash") return "CashBook (US$cash)";

  return null;
}

/**
 * Fixed columns for DOTR / reimbursable description — iba-iba per sheet.
 */
function getDotrColumns(sheetName) {
  switch (sheetName) {
    case "CashBook (US$bank)":
      return { dotr: "T", desc: "U" };
    case "CashBook (US$cash)":
      return { dotr: "S", desc: "T" };
    case "CashBook (PSbank)":
      return { dotr: "V", desc: "W" };
    case "CashBook (PScash)":
      return { dotr: "U", desc: "V" };
    default:
      return { dotr: null, desc: null };
  }
}

// ─── Account Code map (from internal sheet) ──────────────────────────────────

/**
 * Binabasa ang "Account Code" sheet at ginagawang Map:
 *   A_C_code (string o number) → description (string)
 * Data starts at A3 (header rows 1-2 ay instructions lang).
 */
function loadAccountCodeMap(wb) {
  const map = new Map();
  const ws = wb.getWorksheet("Account Code");
  if (!ws) {
    console.warn("Warning: 'Account Code' sheet not found in workbook.");
    return map;
  }
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < 3) return; // skip instruction rows
    const code = row.getCell(1).value; // Column A = code
    const desc = row.getCell(2).value; // Column B = description
    if (code != null && desc != null) {
      // Store as both number and string key so lookup works regardless of type
      map.set(String(code), String(desc));
    }
  });
  return map;
}

// ─── Detect first data row from template ─────────────────────────────────────

/**
 * Hahanapin ang unang data row ng sheet (row na may VLOOKUP formula sa col E).
 * PSbank starts at row 12, lahat ng iba ay row 11.
 */
function getFirstDataRow(ws) {
  for (let r = 8; r <= 20; r++) {
    const eCell = ws.getCell(r, 5); // Column E
    const val = eCell.value;
    if (typeof val === "string" && val.includes("VLOOKUP")) {
      return r;
    }
  }
  return 11; // fallback
}

// ─── Header search ───────────────────────────────────────────────────────────

function findHeaderCell(ws, headerText) {
  const target = headerText.toLowerCase().replace(/\s+/g, " ").trim();
  let found = null;

  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (found) return;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (found) return;
      const v = cell.value;
      if (typeof v !== "string") return;
      const normalized = v.toLowerCase().replace(/\s+/g, " ").trim();
      if (normalized.includes(target)) {
        found = { row: rowNumber, col: colNumber };
      }
    });
  });

  return found;
}

function setBelowHeader(ws, headerCell, offset, value) {
  if (!headerCell) return;
  ws.getCell(headerCell.row + 1 + offset, headerCell.col).value = value;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getEntries(book) {
  return book.ph_cash_banks || book.us_cash_banks || [];
}

// ─── Fill one sheet ──────────────────────────────────────────────────────────

function fillSheet(ws, book, accountCodeMap) {
  const entries = getEntries(book);
  const dotrCols = getDotrColumns(ws.name);
  const firstDataRow = getFirstDataRow(ws);

  // F2: date range end
  ws.getCell("F2").value = book.dateRangeEnd || null;

  // L9: balance brought forward
  ws.getCell("L9").value =
    parseFloat(book.balance_brought_forward_from_previous_month) || 0;

  // Find header cells ONCE before the loop
  const crmHeader = findHeaderCell(ws, "CRM");
  const sNoHeader = findHeaderCell(ws, "S#");
  const arOrHeader = findHeaderCell(ws, "AR/OR#");
  const companyHeader = findHeaderCell(ws, "Company");
  const claimableHeader = findHeaderCell(ws, "Claimable");

  entries.forEach((entry, idx) => {
    const row = firstDataRow + idx; // Correct start row per sheet (11 or 12)

    ws.getCell(`A${row}`).value = idx + 1;
    ws.getCell(`B${row}`).value = entry.date || null;
    ws.getCell(`C${row}`).value = entry.description || "";
    ws.getCell(`D${row}`).value = entry.A_C_code || "";

    // ── Column E: Account Code description — JS lookup sa internal Account Code sheet ──
    // Hindi na ginagamit ang VLOOKUP formula (external workbook ref na hindi available sa ExcelJS).
    // Direktang hinahanap sa accountCodeMap na na-load mula sa "Account Code" sheet.
    // Strip leading zeros para ma-match ang key sa Account Code sheet (e.g. "031" → "31", "000" → "0")
    const acKey = String(parseInt(entry.A_C_code ?? "", 10));
    const acDesc =
      accountCodeMap.get(isNaN(parseInt(entry.A_C_code, 10)) ? "" : acKey) ??
      "";
    ws.getCell(`E${row}`).value = acDesc;

    ws.getCell(`F${row}`).value = entry.job_No || "";
    ws.getCell(`G${row}`).value = entry.reference_no || "";

    // ── Column H: payee/payer no ──
    // Green (FF92D050) kung nagsisimula sa "B" (e.g. B000651, B005223)
    // Yellow (FFFFFF99) kung wala / hindi B-code — ibabalik sa template color
    const hCell = ws.getCell(`H${row}`);
    hCell.value = entry.payee_payer_no || "";
    const isBCode = /^B/i.test(entry.payee_payer_no || "");
    hCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isBCode ? "FF92D050" : "FFFFFF99" },
    };

    ws.getCell(`I${row}`).value = entry.payee_payer || "";
    ws.getCell(`J${row}`).value = parseFloat(entry.receipt) || 0;
    ws.getCell(`K${row}`).value = parseFloat(entry.payment) || 0;
    // L = running balance formula — leave untouched
    ws.getCell(`M${row}`).value = entry.others || "";
    ws.getCell(`N${row}`).value = entry.glCount || "";

    // ── DOTR / reimbursable description ──
    if (dotrCols.dotr) {
      ws.getCell(`${dotrCols.dotr}${row}`).value =
        entry.code_invoice_DOTR || entry.code_invoice_DOTR_1 || "";
    }
    if (dotrCols.desc) {
      ws.getCell(`${dotrCols.desc}${row}`).value =
        entry.reimbursable_description || "";
    }

    // ── Header-based columns ──
    setBelowHeader(ws, crmHeader, idx, entry.CRM ?? "");
    setBelowHeader(ws, sNoHeader, idx, entry.SIno ?? ""); // PH only
    setBelowHeader(ws, arOrHeader, idx, entry.AR_ORNo ?? ""); // PH only
    setBelowHeader(ws, companyHeader, idx, entry.company ?? "");
    setBelowHeader(ws, claimableHeader, idx, entry.Claimable ?? "");
  });
}

// ─── Fill summary sheet ──────────────────────────────────────────────────────

/**
 * Fixes all formulas in the "summary" sheet:
 *
 * 1. D1, D2 → plain values (cover/currentsituation sheets don't exist)
 * 2. C7, F7 → plain date values (period_start, period_end)
 * 3. C11, H11, D56, D57, I56, I57 → simple [4]CashBook refs → internal refs
 * 4. C12:I51 DSUM rows → converted to SUMIF using B column account code
 *    per row, referencing internal CashBook sheets directly
 *
 * @param {ExcelJS.Worksheet} ws
 * @param {object} summary - { project_name, project_code, period_start, period_end }
 */
function fillSummarySheet(ws, summary) {
  // ── 1. Plain values (no internal sheet for these) ──
  // D1/D2 sa template ay may formula (=[4]currentsituation!G7, =[4]cover!F4).
  // ExcelJS ay nagba-back ng formula object — kailangan i-clear muna ang formula
  // bago mag-set ng plain value, otherwise ang formula ay nananatili.
  const d1Cell = ws.getCell("D1");
  d1Cell.value = null; // clear formula first
  d1Cell.value = summary.project_name || "";

  const d2Cell = ws.getCell("D2");
  d2Cell.value = null; // clear formula first
  d2Cell.value = summary.project_code || "";

  // ── 2. Period dates ──
  if (summary.period_start) {
    ws.getCell("C7").value = new Date(summary.period_start);
    ws.getCell("C7").numFmt = "yyyy/mm/dd";
  }
  if (summary.period_end) {
    ws.getCell("F7").value = new Date(summary.period_end);
    ws.getCell("F7").numFmt = "yyyy/mm/dd";
  }

  // ── 3. Simple CashBook refs — just strip [4] to make internal ──
  // C11: US balance brought forward (L9)
  ws.getCell("C11").value = {
    formula: "='CashBook (US$cash) '!L9+'CashBook (US$bank)'!L9",
  };
  // H11: PS balance brought forward (L9)
  ws.getCell("H11").value = {
    formula: "='CashBook (PSbank)'!L9+'CashBook (PScash)'!L9",
  };
  // D56: US bank balance carried forward (L10)
  ws.getCell("D56").value = { formula: "='CashBook (US$bank)'!L10" };
  // D57: US cash balance carried forward (L10)
  ws.getCell("D57").value = { formula: "='CashBook (US$cash) '!L10" };
  // I56: PS bank balance carried forward (L10)
  ws.getCell("I56").value = { formula: "='CashBook (PSbank)'!L10" };
  // I57: PS cash balance carried forward (L10)
  ws.getCell("I57").value = { formula: "='CashBook (PScash)'!L10" };

  // ── 4. DSUM rows → SUMIF using B column account code per row ──
  // Each data row (12–51) has an account code in column B.
  // Original: DSUM(CashBook!$A$7:$K$N, CashBook!$J$7, criteria!$A$x:$A$y)
  // Replaced: SUMIF(CashBook!$D:$D, B{row}, CashBook!$J:$J) for receipts (C/H)
  //           SUMIF(CashBook!$D:$D, B{row}, CashBook!$K:$K) for payments (D/I)
  // D col in CashBook = A_C_code; J = receipt; K = payment

  // Special: row 23 (B23 = "Y101P-7") — text code, SUMIF still works
  for (let row = 12; row <= 51; row++) {
    const bCell = ws.getCell(`B${row}`).value;
    if (bCell == null) continue; // skip rows without account code (e.g. row 53 Total)

    // US$ columns: C = receipt, D = payment
    ws.getCell(`C${row}`).value = {
      formula:
        "=SUMIF('CashBook (US$cash) '!$D$11:$D$5000,B" +
        row +
        ",'CashBook (US$cash) '!$J$11:$J$5000)" +
        "+SUMIF('CashBook (US$bank)'!$D$11:$D$5000,B" +
        row +
        ",'CashBook (US$bank)'!$J$11:$J$5000)",
    };
    ws.getCell(`D${row}`).value = {
      formula:
        "=SUMIF('CashBook (US$cash) '!$D$11:$D$5000,B" +
        row +
        ",'CashBook (US$cash) '!$K$11:$K$5000)" +
        "+SUMIF('CashBook (US$bank)'!$D$11:$D$5000,B" +
        row +
        ",'CashBook (US$bank)'!$K$11:$K$5000)",
    };

    // PS columns: H = receipt, I = payment
    ws.getCell(`H${row}`).value = {
      formula:
        "=SUMIF('CashBook (PSbank)'!$D$11:$D$5000,B" +
        row +
        ",'CashBook (PSbank)'!$J$11:$J$5000)" +
        "+SUMIF('CashBook (PScash)'!$D$11:$D$5000,B" +
        row +
        ",'CashBook (PScash)'!$J$11:$J$5000)",
    };
    ws.getCell(`I${row}`).value = {
      formula:
        "=SUMIF('CashBook (PSbank)'!$D$11:$D$5000,B" +
        row +
        ",'CashBook (PSbank)'!$K$11:$K$5000)" +
        "+SUMIF('CashBook (PScash)'!$D$11:$D$5000,B" +
        row +
        ",'CashBook (PScash)'!$K$11:$K$5000)",
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {object} param0
 * @param {Array}  param0.ph_books  - galing sa collectcashbookData()
 * @param {Array}  param0.us_books  - galing sa collectcashbookData()
 * @param {object} param0.summary   - { project_name, project_code, period_start, period_end }
 * @returns {Promise<Buffer>}
 */
export async function buildSummaryWorkbook({
  ph_books = [],
  us_books = [],
  summary = {},
}) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE_PATH);

  // Fill summary sheet
  const summaryWs = wb.getWorksheet("summary");
  if (summaryWs) {
    fillSummarySheet(summaryWs, summary);
  } else {
    console.warn("Sheet not found: summary");
  }

  const accountCodeMap = loadAccountCodeMap(wb);
  const allBooks = [...ph_books, ...us_books];

  for (const bookRaw of allBooks) {
    const book = bookRaw.toJSON ? bookRaw.toJSON() : bookRaw;

    const sheetName = getSheetName(book.currency, book.category);
    if (!sheetName) {
      console.warn(
        `Skipped cashbook_id=${book.cashbook_id}: unknown currency/category (${book.currency}/${book.category})`,
      );
      continue;
    }

    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`Sheet not found in template: ${sheetName}`);
      continue;
    }

    fillSheet(ws, book, accountCodeMap);
  }

  // ── Preserve drawings/images from template ──
  const excelBuffer = await wb.xlsx.writeBuffer();

  const AdmZip = (await import("adm-zip")).default;
  const templateZip = new AdmZip(TEMPLATE_PATH);
  const outputZip = new AdmZip(Buffer.from(excelBuffer));

  // Step 1: Copy drawing XMLs, vml, comments, media from template → output
  // NOTE: hindi kasama ang xl/worksheets/_rels/ dito — kung iko-copy nang buo,
  // mao-overwrite ang ExcelJS-written cell data (kaya nawala ang D1/D2).
  const drawingPrefixes = ["xl/drawings/", "xl/media/", "xl/comments"];
  for (const entry of templateZip.getEntries()) {
    const name = entry.entryName;
    if (!drawingPrefixes.some((p) => name.startsWith(p))) continue;
    const data = templateZip.readFile(entry);
    try {
      outputZip.deleteFile(name);
    } catch (_) {}
    outputZip.addFile(name, data);
  }

  // Step 2: Restore worksheet rels files (drawing relationships lang, hindi worksheet data)
  // sheet1=US$bank, sheet2=US$cash, sheet3=PSbank, sheet4=PScash, sheet6=summary
  const sheetRelsFiles = [
    "xl/worksheets/_rels/sheet1.xml.rels",
    "xl/worksheets/_rels/sheet2.xml.rels",
    "xl/worksheets/_rels/sheet3.xml.rels",
    "xl/worksheets/_rels/sheet4.xml.rels",
    "xl/worksheets/_rels/sheet6.xml.rels",
  ];
  for (const relsFile of sheetRelsFiles) {
    const entry = templateZip.getEntry(relsFile);
    if (!entry) continue;
    const data = templateZip.readFile(entry);
    try {
      outputZip.deleteFile(relsFile);
    } catch (_) {}
    outputZip.addFile(relsFile, data);
  }

  // Step 3: Inject <drawing> tag into each worksheet XML that needs it.
  // ExcelJS strips these tags on write — re-inject before </worksheet>.
  const sheetDrawingTags = {
    "xl/worksheets/sheet1.xml": '<drawing r:id="rId1"/>',
    "xl/worksheets/sheet2.xml": '<drawing r:id="rId1"/>',
    "xl/worksheets/sheet3.xml": '<drawing r:id="rId1"/>',
    "xl/worksheets/sheet4.xml": '<drawing r:id="rId1"/>',
    "xl/worksheets/sheet6.xml":
      '<drawing r:id="rId2"/><legacyDrawing r:id="rId3"/>',
  };
  for (const [sheetFile, drawingTag] of Object.entries(sheetDrawingTags)) {
    const entry = outputZip.getEntry(sheetFile);
    if (!entry) continue;
    let xml = outputZip.readAsText(entry);
    if (!xml.includes("<drawing ")) {
      xml = xml.replace("</worksheet>", drawingTag + "</worksheet>");
      outputZip.updateFile(sheetFile, Buffer.from(xml, "utf-8"));
    }
  }

  return outputZip.toBuffer();
}
