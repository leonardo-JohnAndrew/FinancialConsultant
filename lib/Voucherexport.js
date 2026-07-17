// /**
//  * lib/voucherExport.js
//  *
//  * Generates a merged Excel workbook from check/voucher data.
//  * Directly fills template files (preserves all formatting/merges).
//  *
//  * Templates (place in project root):
//  *   public/uploads/vouchers/Single_claimable_Voucher.xlsx
//  *   public/uploads/vouchers/Single_Voucher.xlsx
//  *   public/uploads/vouchers/Double_claimable_Voucher.xlsx
//  *   public/uploads/vouchers/Double_Voucher.xlsx
//  *
//  * npm install exceljs
//  */

// import ExcelJS from "exceljs";
// import path from "path";
// import fs from "fs";

// const TEMPLATE_DIR = path.join(process.cwd(), "public", "uploads", "vouchers");

// // Table 1 children: master rows only (skips slave rows of merges)
// const T1_CHILD_ROWS = [13, 15, 16, 17, 18];
// // Table 2 children: master rows only
// const T2_CHILD_ROWS = [37, 39, 40, 41, 42];

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function numToCol(n) {
//   let s = "";
//   while (n > 0) {
//     const r = (n - 1) % 26;
//     s = String.fromCharCode(65 + r) + s;
//     n = Math.floor((n - 1) / 26);
//   }
//   return s;
// }

// /** Map every cell address → its merge-group master address */
// function buildMergeMap(ws) {
//   const map = {};
//   for (const [masterAddr, range] of Object.entries(ws._merges || {})) {
//     const { top, left, bottom, right } = range.model;
//     for (let r = top; r <= bottom; r++)
//       for (let c = left; c <= right; c++)
//         map[`${numToCol(c)}${r}`] = masterAddr;
//   }
//   return map;
// }

// /** Write to master cell (resolves merged slaves automatically) */
// function setCell(ws, mm, addr, value) {
//   ws.getCell(mm[addr] || addr).value = value;
// }

// /** Find cell by placeholder text and replace */
// function setPlaceholder(ws, placeholder, value) {
//   ws.eachRow({ includeEmpty: false }, (row) => {
//     row.eachCell({ includeEmpty: false }, (cell) => {
//       if (cell.value === placeholder) cell.value = value;
//     });
//   });
// }

// /** "CASH USD" → "Cash",  "BANK PHP" → "Bank" */
// function formatCategory(vt) {
//   if (!vt) return "";
//   const w = vt.split(" ")[0];
//   return w[0].toUpperCase() + w.slice(1).toLowerCase();
// }

// /** "CASH USD" → "USD" */
// function formatCurrency(vt) {
//   if (!vt) return "";
//   return vt.split(" ")[1] || "";
// }

// /** "26 YR 04 MO 28 Day" → { y1,y2,m1,m2,d1,d2 } */
// function parseFormattedDate(s) {
//   if (!s) return { y1: "", y2: "", m1: "", m2: "", d1: "", d2: "" };
//   const nums = (s.match(/\d+/g) || []).map((n) =>
//     String(parseInt(n, 10)).padStart(2, "0"),
//   );
//   console.log(s);
//   console.log(JSON.stringify(nums));
//   const [yr = "00", mo = "00", dy = "00"] = nums;
//   return {
//     y1: yr[0],
//     y2: yr[1],
//     m1: mo[0],
//     m2: mo[1],
//   };
// }

// /** "000A-Fund Transfer" → "000A" */
// function parseGlCode(gl) {
//   return gl ? gl.split("-")[0].trim() : "";
// }

// /**
//  * Insert a signature image anchored to a cell range.
//  * Uses `filename` (absolute path) + range string — same pattern as the
//  * working purchaseExportService (buffer approach silently fails in ExcelJS).
//  */
// async function insertSignatureImage(wb, ws, src, cellAddr) {
//   if (!src) return;

//   // Resolve to absolute path under /public (handles leading slash)
//   const relativePath = src.startsWith("/") ? src.slice(1) : src;
//   const absPath = path.join(process.cwd(), "public", relativePath);

//   if (!fs.existsSync(absPath)) {
//     console.warn(`[signature] File not found: ${absPath}`);
//     return;
//   }

//   let ext = path.extname(absPath).slice(1).toLowerCase();
//   if (ext === "jpg") ext = "jpeg";
//   if (!["png", "jpeg", "gif"].includes(ext)) {
//     console.warn(`[signature] Unsupported image ext "${ext}", skipping`);
//     return;
//   }

//   try {
//     // Build a range string spanning a few cols/rows so the image fits visibly
//     // e.g. "N6" → "N6:P7"
//     const colLetters = cellAddr.match(/[A-Z]+/)[0];
//     const rowNum = parseInt(cellAddr.match(/\d+/)[0], 10);
//     let colIndex = 0;
//     for (const ch of colLetters)
//       colIndex = colIndex * 26 + (ch.charCodeAt(0) - 64);
//     const endCol = numToCol(colIndex + 2); // span 3 cols
//     const range = `${cellAddr}:${endCol}${rowNum + 1}`; // span 2 rows

//     const imgId = wb.addImage({ filename: absPath, extension: ext });
//     ws.addImage(imgId, range); // range string → ExcelJS fits image exactly to that area
//   } catch (e) {
//     console.warn(`[signature] Failed to embed (${src}):`, e.message);
//   }
// }

// // ─── Fill children rows ───────────────────────────────────────────────────────

// function fillChildren(ws, mm, children, masterRows, currency) {
//   // Clear template sample data from all master rows
//   for (const r of masterRows) {
//     ws.getCell(`K${r}`).value = null;
//     ws.getCell(`M${r}`).value = null;
//     ws.getCell(`O${r}`).value = null;
//   }
//   // Write children into master rows in order
//   children.forEach((child, idx) => {
//     if (idx >= masterRows.length) return;
//     const r = masterRows[idx];
//     setCell(ws, mm, `K${r}`, child.title || "");
//     setCell(ws, mm, `M${r}`, currency);
//     setCell(ws, mm, `O${r}`, parseFloat(child.amount) || 0);
//   });
// }
// function refreshFormulaCells(ws) {
//   ws.eachRow({ includeEmpty: false }, (row) => {
//     row.eachCell({ includeEmpty: false }, (cell) => {
//       const v = cell.value;
//       if (v && typeof v === "object" && typeof v.formula === "string") {
//         cell.value = { formula: v.formula }; // re-assign, drops cached result
//       }
//     });
//   });
// }
// // ─── Fill one template → Buffer ───────────────────────────────────────────────

// async function fillTemplate(templatePath, item, item2, check, isDouble) {
//   const wb = new ExcelJS.Workbook();
//   await wb.xlsx.readFile(templatePath);
//   const ws = wb.worksheets[0];
//   const mm = buildMergeMap(ws);

//   // ── Claimable indicator (only on *_claimable_Voucher.xlsx templates) ──
//   const templateFileName = path.basename(templatePath);
//   if (/_claimable_Voucher\.xlsx$/i.test(templateFileName)) {
//     if (check.claimable) {
//       setCell(ws, mm, "K23", "X");
//       setCell(ws, mm, "K24", null);
//     } else {
//       setCell(ws, mm, "K24", "X");
//       setCell(ws, mm, "K23", null);
//     }
//   }

//   // ── Signatures (only when both are present) ──
//   if (
//     check.ChiefAccountSignature !== null &&
//     check.ChiefAdminSignature !== null
//   ) {
//     await insertSignatureImage(wb, ws, check.ChiefAccountSignature, "N6");
//     await insertSignatureImage(wb, ws, check.ChiefAdminSignature, "S6");

//     if (isDouble && item2) {
//       await insertSignatureImage(wb, ws, check.ChiefAccountSignature, "N30");
//       await insertSignatureImage(wb, ws, check.ChiefAdminSignature, "S30");
//     }
//   }

//   const d1 = parseFormattedDate(item.payment_voucher_formatted_date);
//   const cur1 = formatCurrency(item.voucherType);

//   // ── Table 1 ──
//   setCell(
//     ws,
//     mm,
//     "A4",
//     item.receiptOrPayment === "payment" ? "PAYMENT VOUCHER" : "RECEIPT VOUCHER",
//   );
//   setCell(ws, mm, "N4", formatCategory(item.voucherType));
//   setCell(ws, mm, "N5", item.voucherTypeNumber || "");
//   setCell(ws, mm, "A6", d1.y1);
//   setCell(ws, mm, "B6", d1.y2);
//   setCell(ws, mm, "E6", d1.m1);
//   setCell(ws, mm, "F6", d1.m2);

//   setCell(
//     ws,
//     mm,
//     "L8",
//     "Amount - Php " +
//       Number(parseFloat(check.checkAmount)).toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }) || 0,
//   );
//   setCell(ws, mm, "L9", item.title || "");
//   setPlaceholder(ws, "{account_code}", item.accountCode || "");
//   setPlaceholder(ws, "{gl_code}", parseGlCode(item.glCode));
//   fillChildren(ws, mm, item.children || [], T1_CHILD_ROWS, cur1);
//   setCell(ws, mm, "M19", cur1);

//   // ── Table 2 (double only) ──
//   if (isDouble && item2) {
//     const d2 = parseFormattedDate(item2.payment_voucher_formatted_date);
//     const cur2 = formatCurrency(item2.voucherType);

//     setCell(
//       ws,
//       mm,
//       "A28",
//       item2.receiptOrPayment === "payment"
//         ? "PAYMENT VOUCHER"
//         : "RECEIPT VOUCHER",
//     );
//     setCell(ws, mm, "N28", formatCategory(item2.voucherType));
//     setCell(ws, mm, "N29", item2.voucherTypeNumber || "");
//     setCell(ws, mm, "A30", d2.y1);
//     setCell(ws, mm, "B30", d2.y2);
//     setCell(ws, mm, "E30", d2.m1);
//     setCell(ws, mm, "F30", d2.m2);

//     setCell(ws, mm, "L33", item2.title || "");
//     setPlaceholder(ws, "{account_code2}", item2.accountCode || "");
//     setPlaceholder(ws, "{gl_code2}", parseGlCode(item2.glCode));
//     fillChildren(ws, mm, item2.children || [], T2_CHILD_ROWS, cur2);
//     setCell(ws, mm, "M43", cur2);
//   }
//   refreshFormulaCells(ws);
//   wb.calcProperties.fullCalcOnLoad = true;
//   // Return as buffer (preserves all formatting/merges from template)
//   return wb.xlsx.writeBuffer();
// }

// // ─── Merge buffers into one workbook ─────────────────────────────────────────

// /**
//  * Takes an array of { buffer, sheetName } and merges them into one workbook.
//  * Each buffer becomes one sheet using addWorksheetFromBuffer (ExcelJS 4.3+).
//  * Falls back to sheet-by-sheet copy if not available.
//  */
// async function mergeBuffers(sheets) {
//   if (sheets.length === 1) {
//     return sheets[0].buffer;
//   }

//   const mergedWb = new ExcelJS.Workbook();

//   for (const { buffer, sheetName } of sheets) {
//     const tmpWb = new ExcelJS.Workbook();
//     await tmpWb.xlsx.load(buffer);

//     const srcWs = tmpWb.worksheets[0];
//     const destWs = mergedWb.addWorksheet(sheetName);

//     destWs.pageSetup = { ...srcWs.pageSetup };
//     destWs.properties = { ...srcWs.properties };

//     srcWs.columns.forEach((col, i) => {
//       const destCol = destWs.getColumn(i + 1);
//       destCol.width = col.width;
//       destCol.hidden = col.hidden;
//     });

//     // ── FIX: alamin muna kung alin sa mga cell ang "slave" ng isang
//     // merged range (hindi ang top-left/master cell). Kailangan ito
//     // dahil kapag isinulat natin ang VALUE sa lahat ng cell kahit
//     // slave pa ito ng merge, nagiging invalid/corrupt ang resultang
//     // XLSX — ito mismo ang dahilan ng "Unable to get the Open property"
//     // error, dahil sira na ang file structure kaya hindi na ito mabuksan
//     // ni Excel (COM man o manual open).
//     const srcMergeMap = {};
//     for (const [masterAddr, range] of Object.entries(srcWs._merges || {})) {
//       const { top, left, bottom, right } = range.model;
//       for (let r = top; r <= bottom; r++) {
//         for (let c = left; c <= right; c++) {
//           srcMergeMap[`${numToCol(c)}${r}`] = masterAddr;
//         }
//       }
//     }

//     srcWs.eachRow({ includeEmpty: true }, (row, rn) => {
//       const destRow = destWs.getRow(rn);
//       destRow.height = row.height;
//       destRow.hidden = row.hidden;
//       row.eachCell({ includeEmpty: true }, (cell, cn) => {
//         const destCell = destRow.getCell(cn);
//         const addr = cell.address;
//         const isMergeSlave = srcMergeMap[addr] && srcMergeMap[addr] !== addr;

//         destCell.style = JSON.parse(JSON.stringify(cell.style || {}));

//         // Value: kopyahin LANG kung hindi ito merge-slave.
//         if (!isMergeSlave) {
//           destCell.value = cell.value;
//         }
//       });
//       destRow.commit();
//     });

//     for (const [, range] of Object.entries(srcWs._merges || {})) {
//       const { top, left, bottom, right } = range.model;
//       destWs.mergeCellsWithoutStyle(top, left, bottom, right);
//     }

//     srcWs.getImages().forEach((img) => {
//       const imgData = tmpWb.getImage(img.imageId);
//       if (!imgData) return;

//       try {
//         let newId;
//         if (imgData.buffer) {
//           newId = mergedWb.addImage({
//             buffer: imgData.buffer,
//             extension: imgData.extension,
//           });
//         } else if (imgData.filename) {
//           const buf = fs.readFileSync(imgData.filename);
//           newId = mergedWb.addImage({
//             buffer: buf,
//             extension: imgData.extension,
//           });
//         } else {
//           return;
//         }
//         destWs.addImage(newId, img.range);
//       } catch (e) {
//         console.warn("[mergeBuffers] Could not copy image:", e.message);
//       }
//     });
//   }

//   mergedWb.worksheets.forEach((ws) => refreshFormulaCells(ws));
//   mergedWb.calcProperties.fullCalcOnLoad = true;
//   return mergedWb.xlsx.writeBuffer();
// }
// // ─── Public API ───────────────────────────────────────────────────────────────

// /**
//  * Build voucher Excel workbook for a check record.
//  *
//  * @param {object} checkData - toJSON() of Sequelize Check (with items + children)
//  * @returns {Promise<Buffer>}
//  */
// export async function buildVoucherWorkbook(checkData) {
//   const items = checkData.items || [];
//   const itemCount = items.length;
//   const isClaimable = !!checkData.claimable;
//   const pairs = Math.floor(itemCount / 2);
//   const remainder = itemCount % 2;

//   const sheets = [];

//   for (let i = 0; i < pairs; i++) {
//     const tplName =
//       i === 0 ? "Double_claimable_Voucher.xlsx" : "Double_Voucher.xlsx";

//     const buffer = await fillTemplate(
//       path.join(TEMPLATE_DIR, tplName),
//       items[i * 2],
//       items[i * 2 + 1],
//       checkData,
//       true,
//     );
//     sheets.push({ buffer, sheetName: `Voucher${i + 1}` });
//   }

//   if (remainder === 1) {
//     const tplName =
//       pairs === 0 ? "Single_claimable_Voucher.xlsx" : "Single_Voucher.xlsx";

//     const buffer = await fillTemplate(
//       path.join(TEMPLATE_DIR, tplName),
//       items[itemCount - 1],
//       null,
//       checkData,
//       false,
//     );
//     sheets.push({ buffer, sheetName: `Voucher${pairs + 1}` });
//   }

//   if (sheets.length === 0) {
//     const wb = new ExcelJS.Workbook();
//     wb.addWorksheet("Empty");
//     return wb.xlsx.writeBuffer();
//   }
//   console.log("Items:", items.length);
//   console.log("Sheets:", sheets.length);

//   return mergeBuffers(sheets);
// }

/**
 * lib/voucherExport.js
 *
 * Generates a merged Excel workbook from check/voucher data.
 * Directly fills template files (preserves all formatting/merges).
 *
 * Templates (place in project root):
 *   public/uploads/vouchers/Single_claimable_Voucher.xlsx
 *   public/uploads/vouchers/Single_Voucher.xlsx
 *   public/uploads/vouchers/Double_claimable_Voucher.xlsx
 *   public/uploads/vouchers/Double_Voucher.xlsx
 *
 * npm install exceljs
 */

import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

const TEMPLATE_DIR = path.join(process.cwd(), "public", "uploads", "vouchers");

// Table 1 children: master rows only (skips slave rows of merges)
const T1_CHILD_ROWS = [13, 15, 16, 17, 18];
// Table 2 children: master rows only
const T2_CHILD_ROWS = [37, 39, 40, 41, 42];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function numToCol(n) {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Map every cell address → its merge-group master address */
function buildMergeMap(ws) {
  const map = {};
  for (const [masterAddr, range] of Object.entries(ws._merges || {})) {
    const { top, left, bottom, right } = range.model;
    for (let r = top; r <= bottom; r++)
      for (let c = left; c <= right; c++)
        map[`${numToCol(c)}${r}`] = masterAddr;
  }
  return map;
}

/** Write to master cell (resolves merged slaves automatically) */
function setCell(ws, mm, addr, value) {
  ws.getCell(mm[addr] || addr).value = value;
}

/** Find cell by placeholder text and replace */
function setPlaceholder(ws, placeholder, value) {
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (cell.value === placeholder) cell.value = value;
    });
  });
}

/** "CASH USD" → "Cash",  "BANK PHP" → "Bank" */
function formatCategory(vt) {
  if (!vt) return "";
  const w = vt.split(" ")[0];
  return w[0].toUpperCase() + w.slice(1).toLowerCase();
}

/** "CASH USD" → "USD" */
function formatCurrency(vt) {
  if (!vt) return "";
  return vt.split(" ")[1] || "";
}

/** "26 YR 04 MO 28 Day" → { y1,y2,m1,m2,d1,d2 } */
function parseFormattedDate(s) {
  if (!s) return { y1: "", y2: "", m1: "", m2: "", d1: "", d2: "" };
  const nums = (s.match(/\d+/g) || []).map((n) =>
    String(parseInt(n, 10)).padStart(2, "0"),
  );
  console.log(s);
  console.log(JSON.stringify(nums));
  const [yr = "00", mo = "00", dy = "00"] = nums;
  return {
    y1: yr[0],
    y2: yr[1],
    m1: mo[0],
    m2: mo[1],
  };
}

/** "000A-Fund Transfer" → "000A" */
function parseGlCode(gl) {
  return gl ? gl.split("-")[0].trim() : "";
}

/**
 * Insert a signature image anchored to a cell range.
 * Uses `filename` (absolute path) + range string — same pattern as the
 * working purchaseExportService (buffer approach silently fails in ExcelJS).
 */
async function insertSignatureImage(wb, ws, src, cellAddr) {
  if (!src) return;

  // Resolve to absolute path under /public (handles leading slash)
  const relativePath = src.startsWith("/") ? src.slice(1) : src;
  const absPath = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(absPath)) {
    console.warn(`[signature] File not found: ${absPath}`);
    return;
  }

  let ext = path.extname(absPath).slice(1).toLowerCase();
  if (ext === "jpg") ext = "jpeg";
  if (!["png", "jpeg", "gif"].includes(ext)) {
    console.warn(`[signature] Unsupported image ext "${ext}", skipping`);
    return;
  }

  try {
    // Build a range string spanning a few cols/rows so the image fits visibly
    // e.g. "N6" → "N6:P7"
    const colLetters = cellAddr.match(/[A-Z]+/)[0];
    const rowNum = parseInt(cellAddr.match(/\d+/)[0], 10);
    let colIndex = 0;
    for (const ch of colLetters)
      colIndex = colIndex * 26 + (ch.charCodeAt(0) - 64);
    const endCol = numToCol(colIndex + 2); // span 3 cols
    const range = `${cellAddr}:${endCol}${rowNum + 1}`; // span 2 rows

    const imgId = wb.addImage({ filename: absPath, extension: ext });
    ws.addImage(imgId, range); // range string → ExcelJS fits image exactly to that area
  } catch (e) {
    console.warn(`[signature] Failed to embed (${src}):`, e.message);
  }
}

// ─── Fill children rows ───────────────────────────────────────────────────────

function fillChildren(ws, mm, children, masterRows, currency) {
  // Clear template sample data from all master rows
  for (const r of masterRows) {
    ws.getCell(`K${r}`).value = null;
    ws.getCell(`M${r}`).value = null;
    ws.getCell(`O${r}`).value = null;
  }
  // Write children into master rows in order
  children.forEach((child, idx) => {
    if (idx >= masterRows.length) return;
    const r = masterRows[idx];
    setCell(ws, mm, `K${r}`, child.title || "");
    setCell(ws, mm, `M${r}`, currency);
    setCell(ws, mm, `O${r}`, parseFloat(child.amount) || 0);
  });
}
function refreshFormulaCells(ws) {
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      const v = cell.value;
      if (v && typeof v === "object" && typeof v.formula === "string") {
        cell.value = { formula: v.formula }; // re-assign, drops cached result
      }
    });
  });
}
// ─── Fill one template → Buffer ───────────────────────────────────────────────

async function fillTemplate(templatePath, item, item2, check, isDouble) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(templatePath);
  const ws = wb.worksheets[0];
  const mm = buildMergeMap(ws);

  // ── Claimable indicator (only on *_claimable_Voucher.xlsx templates) ──
  const templateFileName = path.basename(templatePath);
  if (/_claimable_Voucher\.xlsx$/i.test(templateFileName)) {
    if (check.claimable) {
      setCell(ws, mm, "K23", "X");
      setCell(ws, mm, "K24", null);
    } else {
      setCell(ws, mm, "K24", "X");
      setCell(ws, mm, "K23", null);
    }
  }

  // ── Signatures (only when both are present) ──
  if (
    check.ChiefAccountSignature !== null &&
    check.ChiefAdminSignature !== null
  ) {
    await insertSignatureImage(wb, ws, check.ChiefAccountSignature, "N6");
    await insertSignatureImage(wb, ws, check.ChiefAdminSignature, "S6");

    if (isDouble && item2) {
      await insertSignatureImage(wb, ws, check.ChiefAccountSignature, "N30");
      await insertSignatureImage(wb, ws, check.ChiefAdminSignature, "S30");
    }
  }

  const d1 = parseFormattedDate(item.payment_voucher_formatted_date);
  const cur1 = formatCurrency(item.voucherType);

  // ── Table 1 ──
  setCell(
    ws,
    mm,
    "A4",
    item.receiptOrPayment === "payment" ? "PAYMENT VOUCHER" : "RECEIPT VOUCHER",
  );
  setCell(ws, mm, "N4", formatCategory(item.voucherType));
  setCell(ws, mm, "N5", item.voucherTypeNumber || "");
  setCell(ws, mm, "A6", d1.y1);
  setCell(ws, mm, "B6", d1.y2);
  setCell(ws, mm, "E6", d1.m1);
  setCell(ws, mm, "F6", d1.m2);

  setCell(
    ws,
    mm,
    "L8",
    "Amount - Php " +
      Number(parseFloat(check.checkAmount)).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || 0,
  );
  setCell(ws, mm, "L9", item.title || "");
  setPlaceholder(ws, "{account_code}", item.accountCode || "");
  setPlaceholder(ws, "{gl_code}", parseGlCode(item.glCode));
  fillChildren(ws, mm, item.children || [], T1_CHILD_ROWS, cur1);
  setCell(ws, mm, "M19", cur1);

  // ── Table 2 (double only) ──
  if (isDouble && item2) {
    const d2 = parseFormattedDate(item2.payment_voucher_formatted_date);
    const cur2 = formatCurrency(item2.voucherType);

    setCell(
      ws,
      mm,
      "A28",
      item2.receiptOrPayment === "payment"
        ? "PAYMENT VOUCHER"
        : "RECEIPT VOUCHER",
    );
    setCell(ws, mm, "N28", formatCategory(item2.voucherType));
    setCell(ws, mm, "N29", item2.voucherTypeNumber || "");
    setCell(ws, mm, "A30", d2.y1);
    setCell(ws, mm, "B30", d2.y2);
    setCell(ws, mm, "E30", d2.m1);
    setCell(ws, mm, "F30", d2.m2);

    setCell(ws, mm, "L33", item2.title || "");
    setPlaceholder(ws, "{account_code2}", item2.accountCode || "");
    setPlaceholder(ws, "{gl_code2}", parseGlCode(item2.glCode));
    fillChildren(ws, mm, item2.children || [], T2_CHILD_ROWS, cur2);
    setCell(ws, mm, "M43", cur2);
  }
  refreshFormulaCells(ws);
  wb.calcProperties.fullCalcOnLoad = true;
  // Return as buffer (preserves all formatting/merges from template)
  return wb.xlsx.writeBuffer();
}

// ─── Merge buffers into one workbook ─────────────────────────────────────────

/**
 * Takes an array of { buffer, sheetName } and merges them into one workbook.
 * Each buffer becomes one sheet using addWorksheetFromBuffer (ExcelJS 4.3+).
 * Falls back to sheet-by-sheet copy if not available.
 */
async function mergeBuffers(sheets) {
  // Strategy: use the first buffer as base workbook,
  // then append remaining sheets from other buffers.
  // ExcelJS doesn't have a native "append sheet from another file" —
  // so we write each as a separate named sheet in a fresh workbook
  // by reading each buffer and copying raw XML (reliable approach).

  if (sheets.length === 1) {
    return sheets[0].buffer;
  }

  // For multiple sheets: load each, copy worksheet data into merged workbook
  const mergedWb = new ExcelJS.Workbook();

  for (const { buffer, sheetName } of sheets) {
    const tmpWb = new ExcelJS.Workbook();
    await tmpWb.xlsx.load(buffer);

    const srcWs = tmpWb.worksheets[0];
    const destWs = mergedWb.addWorksheet(sheetName);

    // Copy page setup & properties
    destWs.pageSetup = { ...srcWs.pageSetup };
    destWs.properties = { ...srcWs.properties };

    // Copy column widths & hidden
    srcWs.columns.forEach((col, i) => {
      const destCol = destWs.getColumn(i + 1);
      destCol.width = col.width;
      destCol.hidden = col.hidden;
    });

    // Copy row heights and cells (values + styles)
    srcWs.eachRow({ includeEmpty: true }, (row, rn) => {
      const destRow = destWs.getRow(rn);
      destRow.height = row.height;
      destRow.hidden = row.hidden;
      row.eachCell({ includeEmpty: true }, (cell, cn) => {
        const destCell = destRow.getCell(cn);
        destCell.value = cell.value;
        destCell.style = JSON.parse(JSON.stringify(cell.style || {}));
      });
      destRow.commit();
    });

    // Re-apply merges
    // Re-apply merges (without touching the styles we already copied)
    for (const [, range] of Object.entries(srcWs._merges || {})) {
      const { top, left, bottom, right } = range.model;
      destWs.mergeCellsWithoutStyle(top, left, bottom, right);
    }

    // Copy images
    srcWs.getImages().forEach((img) => {
      const imgData = tmpWb.getImage(img.imageId);
      if (!imgData) return;

      try {
        let newId;
        if (imgData.buffer) {
          // Image was added via buffer
          newId = mergedWb.addImage({
            buffer: imgData.buffer,
            extension: imgData.extension,
          });
        } else if (imgData.filename) {
          // Image was added via filename (our signature approach)
          const buf = fs.readFileSync(imgData.filename);
          newId = mergedWb.addImage({
            buffer: buf,
            extension: imgData.extension,
          });
        } else {
          return; // nothing to copy
        }
        destWs.addImage(newId, img.range);
      } catch (e) {
        console.warn("[mergeBuffers] Could not copy image:", e.message);
      }
    });
  }
  mergedWb.worksheets.forEach((ws) => refreshFormulaCells(ws));
  mergedWb.calcProperties.fullCalcOnLoad = true;
  return mergedWb.xlsx.writeBuffer();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build voucher Excel workbook for a check record.
 *
 * @param {object} checkData - toJSON() of Sequelize Check (with items + children)
 * @returns {Promise<Buffer>}
 */
export async function buildVoucherWorkbook(checkData) {
  const items = checkData.items || [];
  const itemCount = items.length;
  const isClaimable = !!checkData.claimable;
  const pairs = Math.floor(itemCount / 2);
  const remainder = itemCount % 2;

  const sheets = [];

  for (let i = 0; i < pairs; i++) {
    const tplName =
      i === 0 ? "Double_claimable_Voucher.xlsx" : "Double_Voucher.xlsx";

    const buffer = await fillTemplate(
      path.join(TEMPLATE_DIR, tplName),
      items[i * 2],
      items[i * 2 + 1],
      checkData,
      true,
    );
    sheets.push({ buffer, sheetName: `Voucher${i + 1}` });
  }

  if (remainder === 1) {
    const tplName =
      pairs === 0 ? "Single_claimable_Voucher.xlsx" : "Single_Voucher.xlsx";

    const buffer = await fillTemplate(
      path.join(TEMPLATE_DIR, tplName),
      items[itemCount - 1],
      null,
      checkData,
      false,
    );
    sheets.push({ buffer, sheetName: `Voucher${pairs + 1}` });
  }

  if (sheets.length === 0) {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet("Empty");
    return wb.xlsx.writeBuffer();
  }

  return mergeBuffers(sheets);
}
