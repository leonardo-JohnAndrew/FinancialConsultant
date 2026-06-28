// /**
//  * lib/summaryExport.js
//  *
//  * Fills /public/uploads/summary.xlsx with cashbook + sub-entry data.
//  * Layout ng template ay HINDI binabago — values lang ang ilalagay.
//  *
//  * npm install exceljs adm-zip
//  */

// import ExcelJS from "exceljs";
// import path from "path";

// const TEMPLATE_PATH = path.join(
//   process.cwd(),
//   "public",
//   "uploads",
//   "summary.xlsx",
// );

// // ─── Sheet resolver ──────────────────────────────────────────────────────────

// function getSheetName(currency, category) {
//   const cur = (currency || "").toUpperCase();
//   const cat = (category || "").toLowerCase();

//   if (cur === "PH" && cat === "bank") return "CashBook (PSbank)";
//   if (cur === "PH" && cat === "cash") return "CashBook (PScash)";
//   if (cur === "US" && cat === "bank") return "CashBook (US$bank)";
//   if (cur === "US" && cat === "cash") return "CashBook (US$cash)";

//   return null;
// }

// /**
//  * Fixed columns for DOTR / reimbursable description — iba-iba per sheet.
//  */
// function getDotrColumns(sheetName) {
//   switch (sheetName) {
//     case "CashBook (US$bank)":
//       return { dotr: "T", desc: "U" };
//     case "CashBook (US$cash)":
//       return { dotr: "S", desc: "T" };
//     case "CashBook (PSbank)":
//       return { dotr: "V", desc: "W" };
//     case "CashBook (PScash)":
//       return { dotr: "U", desc: "V" };
//     default:
//       return { dotr: null, desc: null };
//   }
// }

// // ─── Account Code map (from internal sheet) ──────────────────────────────────

// /**
//  * Binabasa ang "Account Code" sheet at ginagawang Map:
//  *   A_C_code (string o number) → description (string)
//  * Data starts at A3 (header rows 1-2 ay instructions lang).
//  */
// function loadAccountCodeMap(wb) {
//   const map = new Map();
//   const ws = wb.getWorksheet("Account Code");
//   if (!ws) {
//     console.warn("Warning: 'Account Code' sheet not found in workbook.");
//     return map;
//   }
//   ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//     if (rowNumber < 3) return; // skip instruction rows
//     const code = row.getCell(1).value; // Column A = code
//     const desc = row.getCell(2).value; // Column B = description
//     if (code != null && desc != null) {
//       // Store as both number and string key so lookup works regardless of type
//       map.set(String(code), String(desc));
//     }
//   });
//   return map;
// }

// // ─── Detect first data row from template ─────────────────────────────────────

// /**
//  * Hahanapin ang unang data row ng sheet (row na may VLOOKUP formula sa col E).
//  * PSbank starts at row 12, lahat ng iba ay row 11.
//  */
// function getFirstDataRow(ws) {
//   for (let r = 8; r <= 20; r++) {
//     const eCell = ws.getCell(r, 5); // Column E
//     const val = eCell.value;
//     if (typeof val === "string" && val.includes("VLOOKUP")) {
//       return r;
//     }
//   }
//   return 11; // fallback
// }

// // ─── Header search ───────────────────────────────────────────────────────────

// function findHeaderCell(ws, headerText) {
//   const target = headerText.toLowerCase().replace(/\s+/g, " ").trim();
//   let found = null;

//   ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//     if (found) return;
//     row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
//       if (found) return;
//       const v = cell.value;
//       if (typeof v !== "string") return;
//       const normalized = v.toLowerCase().replace(/\s+/g, " ").trim();
//       if (normalized.includes(target)) {
//         found = { row: rowNumber, col: colNumber };
//       }
//     });
//   });

//   return found;
// }

// function setBelowHeader(ws, headerCell, offset, value) {
//   if (!headerCell) return;
//   ws.getCell(headerCell.row + 1 + offset, headerCell.col).value = value;
// }

// // ─── Helper ──────────────────────────────────────────────────────────────────

// function getEntries(book) {
//   return book.ph_cash_banks || book.us_cash_banks || [];
// }

// // ─── Fill one sheet ──────────────────────────────────────────────────────────

// function fillSheet(ws, book, accountCodeMap) {
//   const entries = getEntries(book);
//   const dotrCols = getDotrColumns(ws.name);
//   const firstDataRow = getFirstDataRow(ws);

//   // F2: date range end
//   ws.getCell("F2").value = book.dateRangeEnd || null;

//   // L9: balance brought forward
//   ws.getCell("L9").value =
//     parseFloat(book.balance_brought_forward_from_previous_month) || 0;

//   // Find header cells ONCE before the loop
//   const crmHeader = findHeaderCell(ws, "CRM");
//   const sNoHeader = findHeaderCell(ws, "S#");
//   const arOrHeader = findHeaderCell(ws, "AR/OR#");
//   const companyHeader = findHeaderCell(ws, "Company");
//   const claimableHeader = findHeaderCell(ws, "Claimable");

//   entries.forEach((entry, idx) => {
//     const row = firstDataRow + idx; // Correct start row per sheet (11 or 12)

//     ws.getCell(`A${row}`).value = idx + 1;
//     ws.getCell(`B${row}`).value = entry.date || null;
//     ws.getCell(`C${row}`).value = entry.description || "";
//     ws.getCell(`D${row}`).value = entry.A_C_code || "";

//     // ── Column E: Account Code description — JS lookup sa internal Account Code sheet ──
//     // Hindi na ginagamit ang VLOOKUP formula (external workbook ref na hindi available sa ExcelJS).
//     // Direktang hinahanap sa accountCodeMap na na-load mula sa "Account Code" sheet.
//     // Strip leading zeros para ma-match ang key sa Account Code sheet (e.g. "031" → "31", "000" → "0")
//     const acKey = String(parseInt(entry.A_C_code ?? "", 10));
//     const acDesc =
//       accountCodeMap.get(isNaN(parseInt(entry.A_C_code, 10)) ? "" : acKey) ??
//       "";
//     ws.getCell(`E${row}`).value = acDesc;

//     ws.getCell(`F${row}`).value = entry.job_No || "";
//     ws.getCell(`G${row}`).value = entry.reference_no || "";

//     // ── Column H: payee/payer no ──
//     // Green (FF92D050) kung nagsisimula sa "B" (e.g. B000651, B005223)
//     // Yellow (FFFFFF99) kung wala / hindi B-code — ibabalik sa template color
//     const hCell = ws.getCell(`H${row}`);
//     hCell.value = entry.payee_payer_no || "";
//     const isBCode = /^B/i.test(entry.payee_payer_no || "");
//     hCell.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: isBCode ? "FF92D050" : "FFFFFF99" },
//     };

//     ws.getCell(`I${row}`).value = entry.payee_payer || "";
//     ws.getCell(`J${row}`).value = parseFloat(entry.receipt) || 0;
//     ws.getCell(`K${row}`).value = parseFloat(entry.payment) || 0;
//     // L = running balance formula — leave untouched
//     ws.getCell(`M${row}`).value = entry.others || "";
//     ws.getCell(`N${row}`).value = entry.glCount || "";

//     // ── DOTR / reimbursable description ──
//     if (dotrCols.dotr) {
//       ws.getCell(`${dotrCols.dotr}${row}`).value =
//         entry.code_invoice_DOTR || entry.code_invoice_DOTR_1 || "";
//     }
//     if (dotrCols.desc) {
//       ws.getCell(`${dotrCols.desc}${row}`).value =
//         entry.reimbursable_description || "";
//     }

//     // ── Header-based columns ──
//     setBelowHeader(ws, crmHeader, idx, entry.CRM ?? "");
//     setBelowHeader(ws, sNoHeader, idx, entry.SIno ?? ""); // PH only
//     setBelowHeader(ws, arOrHeader, idx, entry.AR_ORNo ?? ""); // PH only
//     setBelowHeader(ws, companyHeader, idx, entry.company ?? "");
//     setBelowHeader(ws, claimableHeader, idx, entry.Claimable ?? "");
//   });
// }

// // ─── Fill summary sheet ──────────────────────────────────────────────────────

// /**
//  * Fixes all formulas in the "summary" sheet:
//  *
//  * 1. D1, D2 → plain values (cover/currentsituation sheets don't exist)
//  * 2. C7, F7 → plain date values (period_start, period_end)
//  * 3. C11, H11, D56, D57, I56, I57 → simple [4]CashBook refs → internal refs
//  * 4. C12:I51 DSUM rows → converted to SUMIF using B column account code
//  *    per row, referencing internal CashBook sheets directly
//  *
//  * @param {ExcelJS.Worksheet} ws
//  * @param {object} summary - { project_name, project_code, period_start, period_end }
//  */
// function fillSummarySheet(ws, summary) {
//   // ── 1. Plain values (no internal sheet for these) ──
//   // D1/D2 sa template ay may formula (=[4]currentsituation!G7, =[4]cover!F4).
//   // ExcelJS ay nagba-back ng formula object — kailangan i-clear muna ang formula
//   // bago mag-set ng plain value, otherwise ang formula ay nananatili.
//   const d1Cell = ws.getCell("D1");
//   d1Cell.value = null; // clear formula first
//   d1Cell.value = summary.project_name || "";

//   const d2Cell = ws.getCell("D2");
//   d2Cell.value = null; // clear formula first
//   d2Cell.value = summary.project_code || "";

//   // ── 2. Period dates ──
//   if (summary.period_start) {
//     ws.getCell("C7").value = new Date(summary.period_start);
//     ws.getCell("C7").numFmt = "yyyy/mm/dd";
//   }
//   if (summary.period_end) {
//     ws.getCell("F7").value = new Date(summary.period_end);
//     ws.getCell("F7").numFmt = "yyyy/mm/dd";
//   }

//   // ── 3. Simple CashBook refs — just strip [4] to make internal ──
//   // C11: US balance brought forward (L9)
//   ws.getCell("C11").value = {
//     formula: "='CashBook (US$cash) '!L9+'CashBook (US$bank)'!L9",
//   };
//   // H11: PS balance brought forward (L9)
//   ws.getCell("H11").value = {
//     formula: "='CashBook (PSbank)'!L9+'CashBook (PScash)'!L9",
//   };
//   // D56: US bank balance carried forward (L10)
//   ws.getCell("D56").value = { formula: "='CashBook (US$bank)'!L10" };
//   // D57: US cash balance carried forward (L10)
//   ws.getCell("D57").value = { formula: "='CashBook (US$cash) '!L10" };
//   // I56: PS bank balance carried forward (L10)
//   ws.getCell("I56").value = { formula: "='CashBook (PSbank)'!L10" };
//   // I57: PS cash balance carried forward (L10)
//   ws.getCell("I57").value = { formula: "='CashBook (PScash)'!L10" };

//   // ── 4. DSUM rows → SUMIF using B column account code per row ──
//   // Each data row (12–51) has an account code in column B.
//   // Original: DSUM(CashBook!$A$7:$K$N, CashBook!$J$7, criteria!$A$x:$A$y)
//   // Replaced: SUMIF(CashBook!$D:$D, B{row}, CashBook!$J:$J) for receipts (C/H)
//   //           SUMIF(CashBook!$D:$D, B{row}, CashBook!$K:$K) for payments (D/I)
//   // D col in CashBook = A_C_code; J = receipt; K = payment

//   // Special: row 23 (B23 = "Y101P-7") — text code, SUMIF still works
//   for (let row = 12; row <= 51; row++) {
//     const bCell = ws.getCell(`B${row}`).value;
//     if (bCell == null) continue; // skip rows without account code (e.g. row 53 Total)

//     // US$ columns: C = receipt, D = payment
//     ws.getCell(`C${row}`).value = {
//       formula:
//         "=SUMIF('CashBook (US$cash) '!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (US$cash) '!$J$11:$J$5000)" +
//         "+SUMIF('CashBook (US$bank)'!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (US$bank)'!$J$11:$J$5000)",
//     };
//     ws.getCell(`D${row}`).value = {
//       formula:
//         "=SUMIF('CashBook (US$cash) '!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (US$cash) '!$K$11:$K$5000)" +
//         "+SUMIF('CashBook (US$bank)'!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (US$bank)'!$K$11:$K$5000)",
//     };

//     // PS columns: H = receipt, I = payment
//     ws.getCell(`H${row}`).value = {
//       formula:
//         "=SUMIF('CashBook (PSbank)'!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (PSbank)'!$J$11:$J$5000)" +
//         "+SUMIF('CashBook (PScash)'!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (PScash)'!$J$11:$J$5000)",
//     };
//     ws.getCell(`I${row}`).value = {
//       formula:
//         "=SUMIF('CashBook (PSbank)'!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (PSbank)'!$K$11:$K$5000)" +
//         "+SUMIF('CashBook (PScash)'!$D$11:$D$5000,B" +
//         row +
//         ",'CashBook (PScash)'!$K$11:$K$5000)",
//     };
//   }
// }

// // ─── Public API ───────────────────────────────────────────────────────────────

// /**
//  * @param {object} param0
//  * @param {Array}  param0.ph_books  - galing sa collectcashbookData()
//  * @param {Array}  param0.us_books  - galing sa collectcashbookData()
//  * @param {object} param0.summary   - { project_name, project_code, period_start, period_end }
//  * @returns {Promise<Buffer>}
//  */
// export async function buildSummaryWorkbook({
//   ph_books = [],
//   us_books = [],
//   summary = {},
// }) {
//   const wb = new ExcelJS.Workbook();
//   await wb.xlsx.readFile(TEMPLATE_PATH);

//   // Fill summary sheet
//   const summaryWs = wb.getWorksheet("summary");
//   if (summaryWs) {
//     fillSummarySheet(summaryWs, summary);
//   } else {
//     console.warn("Sheet not found: summary");
//   }

//   const accountCodeMap = loadAccountCodeMap(wb);
//   const allBooks = [...ph_books, ...us_books];

//   for (const bookRaw of allBooks) {
//     const book = bookRaw.toJSON ? bookRaw.toJSON() : bookRaw;

//     const sheetName = getSheetName(book.currency, book.category);
//     if (!sheetName) {
//       console.warn(
//         `Skipped cashbook_id=${book.cashbook_id}: unknown currency/category (${book.currency}/${book.category})`,
//       );
//       continue;
//     }

//     const ws = wb.getWorksheet(sheetName);
//     if (!ws) {
//       console.warn(`Sheet not found in template: ${sheetName}`);
//       continue;
//     }

//     fillSheet(ws, book, accountCodeMap);
//   }

//   // ── Preserve drawings/images from template ──
//   const excelBuffer = await wb.xlsx.writeBuffer();

//   const AdmZip = (await import("adm-zip")).default;
//   const templateZip = new AdmZip(TEMPLATE_PATH);
//   const outputZip = new AdmZip(Buffer.from(excelBuffer));

//   // Step 1: Copy drawing XMLs, vml, comments, media from template → output
//   // NOTE: hindi kasama ang xl/worksheets/_rels/ dito — kung iko-copy nang buo,
//   // mao-overwrite ang ExcelJS-written cell data (kaya nawala ang D1/D2).
//   const drawingPrefixes = ["xl/drawings/", "xl/media/", "xl/comments"];
//   for (const entry of templateZip.getEntries()) {
//     const name = entry.entryName;
//     if (!drawingPrefixes.some((p) => name.startsWith(p))) continue;
//     const data = templateZip.readFile(entry);
//     try {
//       outputZip.deleteFile(name);
//     } catch (_) {}
//     outputZip.addFile(name, data);
//   }

//   // Step 2: Restore worksheet rels files (drawing relationships lang, hindi worksheet data)
//   // sheet1=US$bank, sheet2=US$cash, sheet3=PSbank, sheet4=PScash, sheet6=summary
//   const sheetRelsFiles = [
//     "xl/worksheets/_rels/sheet1.xml.rels",
//     "xl/worksheets/_rels/sheet2.xml.rels",
//     "xl/worksheets/_rels/sheet3.xml.rels",
//     "xl/worksheets/_rels/sheet4.xml.rels",
//     "xl/worksheets/_rels/sheet6.xml.rels",
//   ];
//   for (const relsFile of sheetRelsFiles) {
//     const entry = templateZip.getEntry(relsFile);
//     if (!entry) continue;
//     const data = templateZip.readFile(entry);
//     try {
//       outputZip.deleteFile(relsFile);
//     } catch (_) {}
//     outputZip.addFile(relsFile, data);
//   }

//   // Step 3: Fix drawing tags in each worksheet XML.
//   // ExcelJS sometimes injects wrong/duplicate drawing tags (e.g. legacyDrawing with wrong rId).
//   // Strip ALL existing drawing/legacyDrawing tags first, then re-inject the correct ones.
//   const sheetDrawingTags = {
//     "xl/worksheets/sheet1.xml": '<drawing r:id="rId1"/>',
//     "xl/worksheets/sheet2.xml": '<drawing r:id="rId1"/>',
//     "xl/worksheets/sheet3.xml": '<drawing r:id="rId1"/>',
//     "xl/worksheets/sheet4.xml": '<drawing r:id="rId1"/>',
//     "xl/worksheets/sheet6.xml":
//       '<drawing r:id="rId2"/><legacyDrawing r:id="rId3"/>',
//   };
//   for (const [sheetFile, drawingTag] of Object.entries(sheetDrawingTags)) {
//     const entry = outputZip.getEntry(sheetFile);
//     if (!entry) continue;
//     let xml = outputZip.readAsText(entry);
//     // Strip any existing drawing/legacyDrawing tags (may be wrong rId or duplicated by ExcelJS)
//     xml = xml.replace(/<drawing[^>]*\/>/g, "");
//     xml = xml.replace(/<legacyDrawing[^>]*\/>/g, "");
//     // Re-inject correct tags before </worksheet>
//     xml = xml.replace("</worksheet>", drawingTag + "</worksheet>");
//     outputZip.updateFile(sheetFile, Buffer.from(xml, "utf-8"));
//   }

//   return outputZip.toBuffer();
// }
/**
 * lib/summaryExport.js
 *
 * Fills /public/uploads/summary.xlsx with cashbook + sub-entry data.
 * Layout ng template ay HINDI binabago — values lang ang ilalagay.
 *
 * npm install exceljs adm-zip
 *
 * FIXES APPLIED (see comments tagged "FIX:"):
 *  1. safeDate() guard — Invalid Date objects were being written straight
 *     into cells, which serializes as NaN in the sheet XML and causes
 *     Excel's "we found a problem with some content" repair prompt.
 *     This only happened for rows/summaries with a missing or malformed
 *     date, which is why it was intermittent.
 *  2. Sheet-name resolution is now tolerant of trailing/extra whitespace
 *     in the actual worksheet names inside the template (the formulas in
 *     fillSummarySheet referenced names with a trailing space like
 *     "CashBook (US$cash) ", while getSheetName() returned names without
 *     one — a silent mismatch that could skip writing a book's data).
 *  3. Drawing/legacyDrawing tag-stripping regex now also matches
 *     non-self-closing tag forms, avoiding duplicate tags if ExcelJS ever
 *     emits them that way.
 */

import ExcelJS from "exceljs";
import path from "path";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "summary.xlsx",
);

// ─── Date safety helper ──────────────────────────────────────────────────────

/**
 * FIX #1: Returns a valid Date object, or null if the input is missing /
 * unparsable. Prevents "Invalid Date" from being written into a cell
 * (which ExcelJS will happily serialize as NaN → corrupt XLSX).
 */
function safeDate(value) {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Sheet resolver ──────────────────────────────────────────────────────────

const CANONICAL_SHEET_NAMES = {
  "PH-bank": "CashBook (PSbank)",
  "PH-cash": "CashBook (PScash)",
  "US-bank": "CashBook (US$bank)",
  "US-cash": "CashBook (US$cash)",
};

function getSheetKey(currency, category) {
  const cur = (currency || "").toUpperCase();
  const cat = (category || "").toLowerCase();
  const key = `${cur}-${cat}`;
  return CANONICAL_SHEET_NAMES[key] ? key : null;
}

function getCanonicalSheetName(currency, category) {
  const key = getSheetKey(currency, category);
  return key ? CANONICAL_SHEET_NAMES[key] : null;
}

/**
 * FIX #2: Build a map from canonical sheet name -> actual worksheet object,
 * matching on a whitespace-normalized comparison so trailing/extra spaces
 * in the template's real sheet names don't cause silent mismatches.
 */
function resolveSheetNames(wb) {
  const normalize = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const byNormalized = new Map();
  wb.worksheets.forEach((ws) => {
    byNormalized.set(normalize(ws.name), ws);
  });

  const resolved = {}; // canonical -> { ws, actualName }
  for (const canonical of Object.values(CANONICAL_SHEET_NAMES)) {
    const ws = byNormalized.get(normalize(canonical));
    if (ws) {
      resolved[canonical] = { ws, actualName: ws.name };
    } else {
      console.warn(
        `Warning: could not resolve sheet "${canonical}" in template (whitespace/name mismatch?)`,
      );
    }
  }
  return resolved;
}

/**
 * Fixed columns for DOTR / reimbursable description — iba-iba per sheet.
 * Keyed by canonical name (whitespace-insensitive use is handled by caller).
 */
function getDotrColumns(canonicalSheetName) {
  switch (canonicalSheetName) {
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

// ─── Clear leftover external-workbook formulas ───────────────────────────────

/**
 * FIX #4: The template's CashBook sheets have formulas pre-built down many
 * rows (e.g. column E uses VLOOKUP(...,[4]'Account Code'!...) — a reference
 * to an EXTERNAL workbook, since the template was originally one tab among
 * several linked files). fillSheet() only overwrites column E for rows that
 * have an actual entry; every row beyond that still carries the original
 * external-reference formula. Since that external workbook isn't bundled
 * with the output file, Excel's repair step deletes those formulas
 * ("Removed Records: Formula from .../sheetN.xml").
 *
 * This scans the WHOLE sheet for any formula containing an external-ref
 * marker (e.g. "[4]") and either recomputes it locally (column E, using the
 * same Account Code map) or simply clears it to a blank value.
 */
function clearExternalFormulas(ws, accountCodeMap) {
  const EXTERNAL_REF_PATTERN = /\[\d+\]/;
  const COLUMN_E = 5;
  const COLUMN_D = 4;

  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const v = cell.value;
      const formulaText =
        v && typeof v === "object" && typeof v.formula === "string"
          ? v.formula
          : null;
      if (!formulaText || !EXTERNAL_REF_PATTERN.test(formulaText)) return;

      if (colNumber === COLUMN_E) {
        // Recompute locally instead of just blanking, using the same
        // Account Code lookup logic as fillSheet().
        const dVal = ws.getCell(rowNumber, COLUMN_D).value;
        const parsed = parseInt(dVal, 10);
        const key = isNaN(parsed) ? null : String(parsed);
        cell.value = key != null ? accountCodeMap.get(key) ?? "" : "";
      } else {
        // Unknown external formula elsewhere — just clear it to avoid
        // shipping a dangling external reference.
        cell.value = null;
      }
    });
  });
}

// ─── Fill one sheet ──────────────────────────────────────────────────────────

function fillSheet(ws, book, accountCodeMap, canonicalSheetName) {
  const entries = getEntries(book);
  const dotrCols = getDotrColumns(canonicalSheetName);
  const firstDataRow = getFirstDataRow(ws);

  // F2: date range end
  // FIX #1: guard against invalid dates
  ws.getCell("F2").value = safeDate(book.dateRangeEnd);

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
    // FIX #1: guard against invalid dates
    ws.getCell(`B${row}`).value = safeDate(entry.date);
    ws.getCell(`C${row}`).value = entry.description || "";
    ws.getCell(`D${row}`).value = entry.A_C_code || "";

    // ── Column E: Account Code description — JS lookup sa internal Account Code sheet ──
    // Hindi na ginagamit ang VLOOKUP formula (external workbook ref na hindi available sa ExcelJS).
    // Direktang hinahanap sa accountCodeMap na na-load mula sa "Account Code" sheet.
    // Strip leading zeros para ma-match ang key sa Account Code sheet (e.g. "031" → "31", "000" → "0")
    const parsedCode = parseInt(entry.A_C_code, 10);
    const acKey = isNaN(parsedCode) ? null : String(parsedCode);
    const acDesc = acKey != null ? accountCodeMap.get(acKey) ?? "" : "";
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
 * @param {object} sheetNames - canonical -> actual worksheet name map
 *                 { "CashBook (US$cash)": actualName, ... } (FIX #2)
 */
function fillSummarySheet(ws, summary, sheetNames) {
  // Helper to quote a sheet name safely for use inside a formula string.
  // Excel sheet-name formula refs need single quotes if they contain spaces
  // or special characters like "$" or "#".
  const ref = (canonical) => {
    const name = sheetNames[canonical] || canonical;
    return `'${name}'`;
  };

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
  // FIX #1: guard against invalid dates so we never write NaN/Invalid Date
  const periodStart = safeDate(summary.period_start);
  if (periodStart) {
    ws.getCell("C7").value = periodStart;
    ws.getCell("C7").numFmt = "yyyy/mm/dd";
  }
  const periodEnd = safeDate(summary.period_end);
  if (periodEnd) {
    ws.getCell("F7").value = periodEnd;
    ws.getCell("F7").numFmt = "yyyy/mm/dd";
  }

  // ── 3. Simple CashBook refs — just strip [4] to make internal ──
  // FIX #2: use resolved actual sheet names instead of hardcoded literals
  // (some had a trailing space in the template, some didn't — this avoids
  // ever getting it wrong again if the template changes slightly).
  // C11: US balance brought forward (L9)
  ws.getCell("C11").value = {
    formula: `=${ref("CashBook (US$cash)")}!L9+${ref("CashBook (US$bank)")}!L9`,
  };
  // H11: PS balance brought forward (L9)
  ws.getCell("H11").value = {
    formula: `=${ref("CashBook (PSbank)")}!L9+${ref("CashBook (PScash)")}!L9`,
  };
  // D56: US bank balance carried forward (L10)
  ws.getCell("D56").value = { formula: `=${ref("CashBook (US$bank)")}!L10` };
  // D57: US cash balance carried forward (L10)
  ws.getCell("D57").value = { formula: `=${ref("CashBook (US$cash)")}!L10` };
  // I56: PS bank balance carried forward (L10)
  ws.getCell("I56").value = { formula: `=${ref("CashBook (PSbank)")}!L10` };
  // I57: PS cash balance carried forward (L10)
  ws.getCell("I57").value = { formula: `=${ref("CashBook (PScash)")}!L10` };

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

    const usCash = ref("CashBook (US$cash)");
    const usBank = ref("CashBook (US$bank)");
    const psBank = ref("CashBook (PSbank)");
    const psCash = ref("CashBook (PScash)");

    // US$ columns: C = receipt, D = payment
    ws.getCell(`C${row}`).value = {
      formula:
        `=SUMIF(${usCash}!$D$11:$D$5000,B${row},${usCash}!$J$11:$J$5000)` +
        `+SUMIF(${usBank}!$D$11:$D$5000,B${row},${usBank}!$J$11:$J$5000)`,
    };
    ws.getCell(`D${row}`).value = {
      formula:
        `=SUMIF(${usCash}!$D$11:$D$5000,B${row},${usCash}!$K$11:$K$5000)` +
        `+SUMIF(${usBank}!$D$11:$D$5000,B${row},${usBank}!$K$11:$K$5000)`,
    };

    // PS columns: H = receipt, I = payment
    ws.getCell(`H${row}`).value = {
      formula:
        `=SUMIF(${psBank}!$D$11:$D$5000,B${row},${psBank}!$J$11:$J$5000)` +
        `+SUMIF(${psCash}!$D$11:$D$5000,B${row},${psCash}!$J$11:$J$5000)`,
    };
    ws.getCell(`I${row}`).value = {
      formula:
        `=SUMIF(${psBank}!$D$11:$D$5000,B${row},${psBank}!$K$11:$K$5000)` +
        `+SUMIF(${psCash}!$D$11:$D$5000,B${row},${psCash}!$K$11:$K$5000)`,
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

  // FIX #2: resolve actual worksheet names once, tolerant of stray whitespace
  const resolvedSheets = resolveSheetNames(wb);
  const sheetNameLookup = Object.fromEntries(
    Object.entries(resolvedSheets).map(([canonical, info]) => [
      canonical,
      info.actualName,
    ]),
  );

  // Fill summary sheet
  const summaryWs = wb.getWorksheet("summary");
  if (summaryWs) {
    fillSummarySheet(summaryWs, summary, sheetNameLookup);
  } else {
    console.warn("Sheet not found: summary");
  }

  const accountCodeMap = loadAccountCodeMap(wb);
  const allBooks = [...ph_books, ...us_books];

  for (const bookRaw of allBooks) {
    const book = bookRaw.toJSON ? bookRaw.toJSON() : bookRaw;

    const canonicalSheetName = getCanonicalSheetName(
      book.currency,
      book.category,
    );
    if (!canonicalSheetName) {
      console.warn(
        `Skipped cashbook_id=${book.cashbook_id}: unknown currency/category (${book.currency}/${book.category})`,
      );
      continue;
    }

    const sheetInfo = resolvedSheets[canonicalSheetName];
    if (!sheetInfo) {
      console.warn(`Sheet not found in template: ${canonicalSheetName}`);
      continue;
    }

    fillSheet(sheetInfo.ws, book, accountCodeMap, canonicalSheetName);
  }

  // FIX #4: clean up leftover external-workbook formulas on every CashBook
  // sheet, regardless of whether it had any books filled this run — the
  // template's pre-built rows carry these formulas no matter what.
  for (const { ws } of Object.values(resolvedSheets)) {
    clearExternalFormulas(ws, accountCodeMap);
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

  // Step 1b (FIX #7): re-declare ContentType for the parts we just copied.
  // ExcelJS regenerates [Content_Types].xml from its OWN internal model,
  // which doesn't know about these raw drawing/comments parts (that's why
  // we have to copy their bytes back in manually in the first place). The
  // result is real files sitting in the zip with NO ContentType override —
  // a part with extension ".xml" falls back to the generic
  // "application/xml" type, which is NOT a valid drawing/comments type.
  // Lenient readers (often the desktop Excel build used for testing) will
  // still render it anyway, but stricter readers (other Excel versions,
  // Excel Online/mobile, LibreOffice, Google Sheets) correctly refuse to
  // render an undeclared part — this is what makes the shape ("OCG"
  // textbox) disappear only "pagdinownload ng iba".
  //
  // Fix: pull the matching <Override>/<Default> declarations straight from
  // the TEMPLATE's own [Content_Types].xml (which has them correctly,
  // since it was never touched by ExcelJS) and merge any missing ones into
  // the output's [Content_Types].xml.
  {
    const ctName = "[Content_Types].xml";
    const outCtEntry = outputZip.getEntry(ctName);
    const tplCtEntry = templateZip.getEntry(ctName);
    if (outCtEntry && tplCtEntry) {
      let outXml = outputZip.readAsText(outCtEntry);
      const tplXml = templateZip.readAsText(tplCtEntry);

      const existingOverrides = new Set(
        [...outXml.matchAll(/<Override\s+PartName="([^"]+)"/g)].map(
          (m) => m[1],
        ),
      );
      const existingDefaultExts = new Set(
        [...outXml.matchAll(/<Default\s+Extension="([^"]+)"/g)].map((m) =>
          m[1].toLowerCase(),
        ),
      );

      const toAdd = [];

      // Any <Override> in the template whose PartName falls under one of
      // the prefixes we copied (drawings/, comments, media/) and isn't
      // already declared in the output → add it.
      for (const m of tplXml.matchAll(
        /<Override\s+PartName="([^"]+)"\s+ContentType="([^"]+)"\s*\/>/g,
      )) {
        const [, partName, contentType] = m;
        if (existingOverrides.has(partName)) continue;
        const relevant = ["/xl/drawings/", "/xl/comments", "/xl/media/"].some(
          (p) => partName.startsWith(p),
        );
        if (!relevant) continue;
        toAdd.push(
          `<Override PartName="${partName}" ContentType="${contentType}"/>`,
        );
        existingOverrides.add(partName);
      }

      // Media files (png/jpeg/etc.) are usually typed via <Default
      // Extension="..."> rather than per-file Override — make sure those
      // extensions are declared too, in case the template uses any image
      // formats not yet declared in the output.
      const mediaExts = [
        "png",
        "jpeg",
        "jpg",
        "gif",
        "bmp",
        "tiff",
        "emf",
        "wmf",
      ];
      for (const m of tplXml.matchAll(
        /<Default\s+Extension="([^"]+)"\s+ContentType="([^"]+)"\s*\/>/g,
      )) {
        const [, ext, contentType] = m;
        const extLower = ext.toLowerCase();
        if (existingDefaultExts.has(extLower)) continue;
        if (!mediaExts.includes(extLower)) continue;
        toAdd.push(`<Default Extension="${ext}" ContentType="${contentType}"/>`);
        existingDefaultExts.add(extLower);
      }

      if (toAdd.length > 0) {
        outXml = outXml.replace("</Types>", toAdd.join("") + "</Types>");
        outputZip.updateFile(ctName, Buffer.from(outXml, "utf-8"));
      }
    }
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
  // FIX #5: keep the actual text of each restored .rels file so Step 3 can
  // look up the REAL relationship Id for the drawing/legacyDrawing, instead
  // of assuming it's always rId1/rId2/rId3. A hardcoded assumption that
  // doesn't match what's actually in the (template's own) .rels file is
  // exactly what produces "Removed Part: Drawing shape" on open — the
  // worksheet points at a relationship Id that doesn't exist.
  const restoredRelsText = {};
  for (const relsFile of sheetRelsFiles) {
    const entry = templateZip.getEntry(relsFile);
    if (!entry) continue;
    const data = templateZip.readFile(entry);
    restoredRelsText[relsFile] = data.toString("utf-8");
    try {
      outputZip.deleteFile(relsFile);
    } catch (_) {}
    outputZip.addFile(relsFile, data);
  }

  /**
   * Find the relationship Id whose Type ends with the given suffix
   * (e.g. ".../relationships/drawing" or ".../relationships/vmlDrawing").
   */
  function findRelId(relsXml, typeSuffixLower) {
    if (!relsXml) return null;
    const relRegex = /<Relationship\b([^>]*)\/>/g;
    let m;
    while ((m = relRegex.exec(relsXml))) {
      const attrs = m[1];
      const idMatch = attrs.match(/Id="([^"]+)"/);
      const typeMatch = attrs.match(/Type="([^"]+)"/);
      if (!idMatch || !typeMatch) continue;
      if (typeMatch[1].toLowerCase().endsWith(typeSuffixLower)) {
        return idMatch[1];
      }
    }
    return null;
  }

  /** All relationship Ids present in a .rels file's text, for validation. */
  function getAllRelIds(relsXml) {
    const ids = new Set();
    if (!relsXml) return ids;
    const relRegex = /<Relationship\b([^>]*)\/>/g;
    let m;
    while ((m = relRegex.exec(relsXml))) {
      const idMatch = m[1].match(/Id="([^"]+)"/);
      if (idMatch) ids.add(idMatch[1]);
    }
    return ids;
  }

  // Step 3: Fix drawing tags in each worksheet XML.
  // ExcelJS sometimes injects wrong/duplicate drawing tags (e.g. legacyDrawing with wrong rId).
  //
  // FIX #5 (revised): resolving the rId is layered so a picture is never
  // silently dropped:
  //   1. If the tag ExcelJS already wrote still points at a rId that
  //      genuinely exists in the restored .rels file, KEEP it as-is.
  //   2. Otherwise, look up the rId by relationship Type (drawing /
  //      vmlDrawing) in the restored .rels file.
  //   3. Otherwise, fall back to the old hardcoded guess (rId1 / rId2 /
  //      rId3) IF AND ONLY IF that guess actually exists in the .rels file.
  //   4. Only if none of the above resolve do we leave the tag untouched —
  //      we never strip a tag without something valid to replace it with.
  const sheetToRelsFile = {
    "xl/worksheets/sheet1.xml": "xl/worksheets/_rels/sheet1.xml.rels",
    "xl/worksheets/sheet2.xml": "xl/worksheets/_rels/sheet2.xml.rels",
    "xl/worksheets/sheet3.xml": "xl/worksheets/_rels/sheet3.xml.rels",
    "xl/worksheets/sheet4.xml": "xl/worksheets/_rels/sheet4.xml.rels",
    "xl/worksheets/sheet6.xml": "xl/worksheets/_rels/sheet6.xml.rels",
  };
  const fallbackGuess = {
    "xl/worksheets/sheet1.xml": { drawing: "rId1" },
    "xl/worksheets/sheet2.xml": { drawing: "rId1" },
    "xl/worksheets/sheet3.xml": { drawing: "rId1" },
    "xl/worksheets/sheet4.xml": { drawing: "rId1" },
    "xl/worksheets/sheet6.xml": { drawing: "rId2", legacy: "rId3" },
  };

  for (const [sheetFile, relsFile] of Object.entries(sheetToRelsFile)) {
    const entry = outputZip.getEntry(sheetFile);
    if (!entry) continue;

    const relsXml = restoredRelsText[relsFile];
    const validIds = getAllRelIds(relsXml);

    let xml = outputZip.readAsText(entry);

    // What does the worksheet currently say (as written by ExcelJS)?
    const existingDrawingMatch = xml.match(/<drawing\b[^>]*\br:id="([^"]+)"/);
    const existingVmlMatch = xml.match(/<legacyDrawing\b[^>]*\br:id="([^"]+)"/);
    const existingDrawingId = existingDrawingMatch
      ? existingDrawingMatch[1]
      : null;
    const existingVmlId = existingVmlMatch ? existingVmlMatch[1] : null;

    // Resolve drawing rId: keep existing if valid → else type lookup →
    // else hardcoded fallback (only if that fallback id actually exists).
    let drawingId =
      existingDrawingId && validIds.has(existingDrawingId)
        ? existingDrawingId
        : findRelId(relsXml, "/drawing");
    if (!drawingId) {
      const guess = fallbackGuess[sheetFile]?.drawing;
      if (guess && validIds.has(guess)) drawingId = guess;
    }

    // Same for legacyDrawing (VML — used for comments/legacy shapes).
    let vmlId =
      existingVmlId && validIds.has(existingVmlId)
        ? existingVmlId
        : findRelId(relsXml, "/vmldrawing");
    if (!vmlId) {
      const guess = fallbackGuess[sheetFile]?.legacy;
      if (guess && validIds.has(guess)) vmlId = guess;
    }

    if (!drawingId && !vmlId) {
      // Nothing resolvable either way — leave the worksheet exactly as
      // ExcelJS wrote it rather than stripping a tag we can't replace.
      continue;
    }

    let drawingTag = "";
    if (drawingId) drawingTag += `<drawing r:id="${drawingId}"/>`;
    if (vmlId) drawingTag += `<legacyDrawing r:id="${vmlId}"/>`;

    // Strip any existing drawing/legacyDrawing tags, self-closing or not
    // (may be wrong rId or duplicated by ExcelJS), then re-inject the
    // resolved tag(s).
    xml = xml.replace(/<drawing\b[^>]*\/>/g, "");
    xml = xml.replace(/<drawing\b[^>]*>.*?<\/drawing>/gs, "");
    xml = xml.replace(/<legacyDrawing\b[^>]*\/>/g, "");
    xml = xml.replace(/<legacyDrawing\b[^>]*>.*?<\/legacyDrawing>/gs, "");
    xml = xml.replace("</worksheet>", drawingTag + "</worksheet>");
    outputZip.updateFile(sheetFile, Buffer.from(xml, "utf-8"));
  }

  // Step 4: Strip dangling external-workbook references from workbook.xml.
  // FIX #6: the template was originally one tab among several linked
  // external files (the "[4]..." references seen elsewhere in this file).
  // ExcelJS round-trips xl/workbook.xml's <externalReferences> and any
  // <definedNames> tied to that external link as-is. Since the external
  // workbook isn't bundled with this output file, Excel's repair step
  // deletes them on open ("Removed Records: Named range from workbook.xml").
  // We remove them ourselves so there's nothing left to repair.
  {
    const workbookEntry = outputZip.getEntry("xl/workbook.xml");
    if (workbookEntry) {
      let xml = outputZip.readAsText(workbookEntry);

      // Remove the externalReferences block entirely — nothing in this
      // output file should still depend on an external workbook.
      xml = xml.replace(/<externalReferences>.*?<\/externalReferences>/gs, "");

      // Remove only the definedName entries that still point at an
      // external workbook (formula text contains "[<digit>]"), leaving
      // any legitimate internal named ranges (print areas, etc.) intact.
      xml = xml.replace(
        /<definedName\b[^>]*>(?:(?!<\/definedName>).)*?\[\d+\](?:(?!<\/definedName>).)*?<\/definedName>/gs,
        "",
      );

      outputZip.updateFile("xl/workbook.xml", Buffer.from(xml, "utf-8"));
    }

    // Remove the now-orphaned external link parts themselves, plus their
    // registrations in workbook.xml.rels and [Content_Types].xml.
    const externalLinkEntries = outputZip
      .getEntries()
      .filter((e) => e.entryName.startsWith("xl/externalLinks/"));
    for (const e of externalLinkEntries) {
      outputZip.deleteFile(e.entryName);
    }

    const wbRelsEntry = outputZip.getEntry("xl/_rels/workbook.xml.rels");
    if (wbRelsEntry) {
      let xml = outputZip.readAsText(wbRelsEntry);
      xml = xml.replace(
        /<Relationship\b[^>]*Target="externalLinks\/[^"]*"[^>]*\/>/g,
        "",
      );
      outputZip.updateFile("xl/_rels/workbook.xml.rels", Buffer.from(xml, "utf-8"));
    }

    const contentTypesEntry = outputZip.getEntry("[Content_Types].xml");
    if (contentTypesEntry) {
      let xml = outputZip.readAsText(contentTypesEntry);
      xml = xml.replace(
        /<Override\b[^>]*PartName="\/xl\/externalLinks\/[^"]*"[^>]*\/>/g,
        "",
      );
      outputZip.updateFile("[Content_Types].xml", Buffer.from(xml, "utf-8"));
    }
  }

  return outputZip.toBuffer();
}