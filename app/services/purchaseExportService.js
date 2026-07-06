/**
 * purchaseExportService.js
 *
 * Fills /public/uploads/PRFORM.xls (converted to xlsx at runtime) with data
 * from a Purchase record and returns the filled workbook as a Buffer.
 *
 * New template layout (Sheet1):
 *   B7        {PurchaseID}
 *   M7        {created_at}
 *   E10       {department}
 *   ─── Items table ────────────────────────────────
 *   Row 16    Headers: ITEM | Description (C:J) | Qty (K) | Unit (L) | UnitPrice (M) | Total (N)
 *   Rows 17-48  Item data rows (32 rows, C:J merged per row)
 *   N49       =SUM(N17:N48)  (grand total – kept as formula, auto)
 *   ─── Claimable checkbox ─────────────────────────
 *   E60       "X" if ANY item is Claimable, else empty
 *   E61       "X" if NO item is Claimable, else empty
 *   ─── Signatures ─────────────────────────────────
 *   Row 53    Labels: Requisitionist | Noted By | Approved by
 *   Row 54    Signature images: B54 (Employee) | F54 (ChiefAdmin) | J54 (PD)
 *   Row 55    Names: B55={EmployeeName} | F55={ChiefAdminManagerName} | J55=ProjectDirectorName
 *   Row 56    Titles: Employee Name | Chief Administrator | Project Director
 */

const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { Purchase, PurchaseItems, User } = require("@/db/models"); // adjust to your models path

const { execFile } = require("child_process");
const os = require("os");

// Support both .xlsx and the original .xls filename.
// exceljs cannot read .xls (legacy format), so if only .xls exists,
// we convert it to .xlsx on-the-fly using LibreOffice once and cache it.
async function resolveTemplatePath() {
  const xlsx = path.join(process.cwd(), "public", "uploads", "PRFORM.xlsx");
  const xls = path.join(process.cwd(), "public", "uploads", "PRFORM.xls");

  if (fs.existsSync(xlsx)) return xlsx;
  if (!fs.existsSync(xls)) {
    throw new Error(
      "Template not found: put PRFORM.xlsx (or PRFORM.xls) in /public/uploads/",
    );
  }

  // Convert .xls -> .xlsx using LibreOffice, output next to the original
  console.log(
    "[export] PRFORM.xlsx not found, converting from .xls via LibreOffice...",
  );
  const soffice = process.env.SOFFICE_PATH || "soffice";
  await new Promise((resolve, reject) => {
    execFile(
      soffice,
      [
        "--headless",
        "--convert-to",
        "xlsx",
        xls,
        "--outdir",
        path.join(process.cwd(), "public", "uploads"),
      ],
      (err, stdout, stderr) => {
        if (err)
          return reject(
            new Error(
              `LibreOffice conversion failed: ${stderr || err.message}`,
            ),
          );
        resolve();
      },
    );
  });

  if (!fs.existsSync(xlsx)) {
    throw new Error(
      "LibreOffice conversion produced no output — check LibreOffice is installed",
    );
  }
  console.log("[export] Conversion done, using PRFORM.xlsx");
  return xlsx;
}
const PUBLIC_DIR = path.join(process.cwd(), "public");

const ITEMS_START_ROW = 17;
const ITEMS_END_ROW = 48; // template has rows 17–48 for items
const TOTAL_ROW = 49;

// Signature image anchors: top-left cell + max width so wide sigs get scaled down
const SIGN_ANCHORS = {
  e: { cell: "C54" }, // Employee
  chiefAdmin: { cell: "G54" }, // Chief Admin
  pd: { cell: "L54" }, // Project Director
};

// 2cm × 2cm at 96 DPI: 1cm = 96/2.54 ≈ 37.8px → 2cm ≈ 76px
const SIGNATURE_SIZE = 76; // px — same width and height for all signatures

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fullName(user) {
  if (!user) return "";
  return [user.firstname, user.middle, user.lastname].filter(Boolean).join(" ");
}

// Minimal PNG/JPEG/GIF dimension reader – no extra npm package needed
function getImageDimensions(buffer) {
  if (buffer.length > 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.toString("ascii", 0, 3) === "GIF") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const segLen = buffer.readUInt16BE(offset + 2);
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + segLen;
    }
  }
  return null;
}

function resolveImagePath(storedPath, label) {
  if (!storedPath) {
    console.log(`[signature] ${label}: no path stored`);
    return null;
  }
  const rel = storedPath.startsWith("/") ? storedPath.slice(1) : storedPath;
  const abs = path.join(PUBLIC_DIR, rel);
  if (!fs.existsSync(abs)) {
    console.log(
      `[signature] ${label}: file not found at "${abs}" (stored: "${storedPath}")`,
    );
    return null;
  }
  return abs;
}

function addSignatureImage(workbook, sheet, imagePath, anchor, label) {
  // Always clear placeholder text in the image row cell
  sheet.getCell(anchor.cell).value = "";

  if (!imagePath) return;

  let ext = path.extname(imagePath).slice(1).toLowerCase();
  if (ext === "jpg") ext = "jpeg";
  if (!["png", "jpeg", "gif"].includes(ext)) {
    console.log(`[signature] ${label}: unsupported extension "${ext}"`);
    return;
  }

  try {
    const buffer = fs.readFileSync(imagePath);

    const col = anchor.cell.match(/[A-Z]+/)[0];
    const row = Number(anchor.cell.match(/\d+/)[0]);
    const colIndex =
      col.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) -
      1;

    // tl.row is 0-based in exceljs. Place the image so it sits fully
    // above the name row (row 55). Start 2 rows above the anchor cell
    // so the image doesn't bleed into the name text below.
    const imageId = workbook.addImage({ buffer, extension: ext });
    sheet.addImage(imageId, {
      tl: { col: colIndex, row: row - 3 },
      ext: { width: SIGNATURE_SIZE, height: SIGNATURE_SIZE },
    });
  } catch (err) {
    console.log(`[signature] ${label}: failed to embed – ${err.message}`);
  }
}

// ─── main export function ────────────────────────────────────────────────────

/**
 * @param {string} purchaseId
 * @returns {Promise<Buffer>} filled .xlsx as a Buffer
 */
async function exportPurchaseToExcel(purchaseId) {
  // Fetch purchase header + user + items directly (avoids association-alias issues)
  const purchase = await Purchase.findOne({
    where: { PurchaseID: purchaseId },
  });
  if (!purchase) throw new Error(`Purchase ${purchaseId} not found`);

  const [items, requestor] = await Promise.all([
    PurchaseItems.findAll({
      where: { PurchaseID: purchaseId },
      order: [["id", "ASC"]],
    }),
    purchase.UserID
      ? User.findOne({ where: { userID: purchase.UserID } })
      : null,
  ]);

  console.log(`[export] items: ${items.length}, user: ${!!requestor}`);

  const templatePath = await resolveTemplatePath();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  // Log available sheet names to help debug mismatches
  console.log(
    "[export] sheets in workbook:",
    workbook.worksheets.map((s) => s.name),
  );

  const sheet =
    workbook.getWorksheet("Sheet1") ||
    workbook.getWorksheet("sheet1") ||
    workbook.getWorksheet(1) || // by index (1-based in exceljs)
    workbook.worksheets[0]; // absolute fallback: first sheet regardless of name

  if (!sheet)
    throw new Error(
      "Template workbook has no worksheets — check PRFORM.xlsx exists and is valid",
    );

  // ── Header ──────────────────────────────────────────────────────────────────
  sheet.getCell("B7").value = purchase.PurchaseID;
  sheet.getCell("M7").value = fmtDate(purchase.createdAt);
  sheet.getCell("E10").value = purchase.RequestorDepartment;

  // ── Signatory names ──────────────────────────────────────────────────────────
  sheet.getCell("B55").value = fullName(requestor);
  sheet.getCell("F55").value = purchase.ChiefAdminManagerName;
  sheet.getCell("J55").value = purchase.ProjectDirectorName || "Jorge Muller";

  // ── Signature images (no Admin sign in new template) ──────────────────────────
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.EmployeeSign, "EmployeeSign"),
    SIGN_ANCHORS.e,
    "EmployeeSign",
  );
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.ChiefAdminManageSign, "ChiefAdminManageSign"),
    SIGN_ANCHORS.chiefAdmin,
    "ChiefAdminManageSign",
  );
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.ProjectDirectorSign, "ProjectDirectorSign"),
    SIGN_ANCHORS.pd,
    "ProjectDirectorSign",
  );

  // ── Claimable checkbox (E60 / E61) ──────────────────────────────────────────
  // Only ONE "X" – E60 if any item is claimable, E61 if none are claimable.
  const hasClaimable = items.some((it) => it.Claimable);
  sheet.getCell("E60").value = hasClaimable ? "X" : "";
  sheet.getCell("E61").value = hasClaimable ? "" : "X";

  // ── Items table ──────────────────────────────────────────────────────────────
  // New template columns: B=No, C=Description, K=Qty, L=Unit, M=UnitPrice, N=Total
  // Claimable / TypeOfExpenses / Remarks are no longer in the table.

  // Fill item rows (formula only on rows with actual data)
  items.forEach((item, idx) => {
    const r = ITEMS_START_ROW + idx;
    if (r > ITEMS_END_ROW) return; // safety cap at template's last row

    sheet.getCell(`B${r}`).value = idx + 1;
    sheet.getCell(`C${r}`).value = item.ItemName;
    sheet.getCell(`K${r}`).value = item.Quantity;
    sheet.getCell(`L${r}`).value = item.Unit;
    sheet.getCell(`M${r}`).value =
      item.UnitPrice != null ? Number(item.UnitPrice) : null;
    sheet.getCell(`N${r}`).value = { formula: `K${r}*M${r}` }; // auto total per line
  });

  // Clear leftover rows completely — no formula, so no 0 or "-" appears
  for (let r = ITEMS_START_ROW + items.length; r <= ITEMS_END_ROW; r++) {
    ["B", "C", "K", "L", "M", "N"].forEach((col) => {
      sheet.getCell(`${col}${r}`).value = null;
    });
  }

  // Grand total: update formula to cover full range just in case template had partial range
  sheet.getCell(`N${TOTAL_ROW}`).value = {
    formula: `SUM(N${ITEMS_START_ROW}:N${ITEMS_END_ROW})`,
  };

  // Sync Purchase.Total to DB (optional)
  const grandTotal = items.reduce(
    (sum, it) => sum + (Number(it.Quantity) || 0) * (Number(it.UnitPrice) || 0),
    0,
  );
  if (Number(purchase.Total) !== grandTotal) {
    await purchase.update({ Total: grandTotal });
  }

  return workbook.xlsx.writeBuffer();
}

module.exports = { exportPurchaseToExcel };
