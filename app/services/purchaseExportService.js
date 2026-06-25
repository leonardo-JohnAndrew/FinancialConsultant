/**
 * purchaseExportService.js
 *
 * Fills /public/uploads/PRFORM.xlsx with data from a Purchase record
 * (Purchase -> User, Purchase -> PurchaseItems) and returns the filled
 * workbook as a Buffer ready to send to the client.
 *
 * Install: npm install exceljs
 *
 * Template layout (Sheet1) used by this script:
 *   B7   {PurchaseID}
 *   P7   {created_at}
 *   E10  {department}
 *   C14  {PRCODE}
 *   Items table: rows 17-22 fixed, columns
 *        B=No  C:J=Description(merged)  K=Qty  L=Unit
 *        M=Claimable  N=TypeOfExpenses  O=Remark  P=UnitPrice  Q=Total(=K*P)
 *   Q23  Grand total =SUM(Q17:Q22)  <-- already a formula, stays automatic
 *   C28/G28/J28/N28   signature images (e-sign, admin-sign, chiefadmin-sign, PD-sign)
 *   B29/F29/J29/N29   signatory names
 */

const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { Purchase, PurchaseItems, User } = require("@/db/models"); // or "@/models" if you use that alias

// In Next.js, __dirname can be unreliable once bundled for serverless deploy
// (Vercel, etc). process.cwd() reliably points at the project root both in
// `next dev` and after build, and /public is always served from there.
const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "PRFORM.xlsx",
);
const PUBLIC_DIR = path.join(process.cwd(), "public");

const ITEMS_START_ROW = 17;
const ITEMS_FIXED_ROWS = 6; // rows 17-22 already formatted/merged in the template
const TOTAL_ROW_TEMPLATE = 23;

const SIGN_RANGES = {
  // exact cell ranges to anchor each signature image to (matches the
  // template's own merges where they exist, so the image auto-fits the
  // cell instead of relying on guessed pixel sizes)
  e: "C28:E28", // employee (not merged in template, widened a bit so the image isn't squished)
  admin: "G28:I28", // admin (not merged in template)
  chiefAdmin: "J28:M28", // matches template merge
  pd: "N28:Q28", // matches template merge
};

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

// purchase.EmployeeSign / AdminSign / etc. are stored as paths like "/uploads/signatures/x.png"
function resolveImagePath(storedPath, label) {
  if (!storedPath) {
    console.log(`[signature] ${label}: no path stored on the purchase record`);
    return null;
  }
  const rel = storedPath.startsWith("/") ? storedPath.slice(1) : storedPath;
  const abs = path.join(PUBLIC_DIR, rel);
  const exists = fs.existsSync(abs);
  if (!exists) {
    console.log(
      `[signature] ${label}: stored value "${storedPath}" does not resolve to a real file at "${abs}". ` +
        `(If this prints the literal placeholder text like "{chiefadmine-sign}", that column in the DB ` +
        `still has the template's dummy value instead of a real signature file path.)`,
    );
    return null;
  }
  return abs;
}

function addSignatureImage(workbook, sheet, imagePath, range, label) {
  // Always clear whatever placeholder text/value is in the anchor cell first,
  // regardless of whether we end up successfully adding an image.
  const anchorCell = range.split(":")[0];
  sheet.getCell(anchorCell).value = "";

  if (!imagePath) return;

  let ext = path.extname(imagePath).slice(1).toLowerCase();
  if (ext === "jpg") ext = "jpeg";
  if (!["png", "jpeg", "gif"].includes(ext)) {
    console.log(
      `[signature] ${label}: unsupported image extension "${ext}", skipping image`,
    );
    return;
  }

  try {
    const imageId = workbook.addImage({ filename: imagePath, extension: ext });
    sheet.addImage(imageId, range); // range string -> exceljs fits the image exactly to that cell range
  } catch (err) {
    console.log(
      `[signature] ${label}: failed to embed image (${imagePath}):`,
      err.message,
    );
  }
}

/**
 * @param {string} purchaseId
 * @returns {Promise<Buffer>} filled .xlsx file as a buffer
 */
async function exportPurchaseToExcel(purchaseId) {
  const purchase = await Purchase.findOne({
    where: { PurchaseID: purchaseId },
  });

  if (!purchase) throw new Error(`Purchase ${purchaseId} not found`);

  // Fetched directly by foreign key instead of through a hasMany/belongsTo
  // `include`. This sidesteps any association-alias mismatch in your models
  // index, which is the most common reason these come back empty even
  // though the purchase header loads fine.
  const [items, requestor] = await Promise.all([
    PurchaseItems.findAll({
      where: { PurchaseID: purchaseId },
      order: [["id", "ASC"]],
    }),
    purchase.UserID ?
      User.findOne({ where: { userID: purchase.UserID } })
    : null,
  ]);

  console.log(`[exportPurchaseToExcel] purchase found:`, !!purchase);
  console.log(`[exportPurchaseToExcel] items found:`, items.length);
  console.log(
    `[exportPurchaseToExcel] requestor (User) found:`,
    !!requestor,
    "UserID on purchase:",
    purchase.UserID,
  );
  if (items.length === 0) {
    console.log(
      `[exportPurchaseToExcel] No PurchaseItems row has PurchaseID = "${purchaseId}". ` +
        `Double check that purchaseitems.PurchaseID actually stores this exact value ` +
        `(matching type/case) for the items you expect to see.`,
    );
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const sheet = workbook.getWorksheet("Sheet1") || workbook.worksheets[0];

  // ---------- Header ----------
  sheet.getCell("B7").value = purchase.PurchaseID;
  sheet.getCell("P7").value = fmtDate(purchase.createdAt);
  sheet.getCell("E10").value = purchase.RequestorDepartment;
  sheet.getCell("C14").value = purchase.PRCode;

  // ---------- Signatory names ----------
  sheet.getCell("B29").value = fullName(requestor);
  sheet.getCell("F29").value = purchase.AdminName;
  sheet.getCell("J29").value = purchase.ChiefAdminManagerName;
  // NOTE: the template hardcodes "Jorge Muller" in N29 instead of a {placeholder}.
  // Treated here the same as the other three so it's always pulled from the DB
  // (falls back to the template's own value if ProjectDirectorName isn't set).
  sheet.getCell("N29").value = purchase.ProjectDirectorName || "Jorge Muller";

  // ---------- Signature images ----------
  // addSignatureImage clears the placeholder text in the anchor cell itself,
  // whether or not a usable image is found, and logs why if it can't resolve one.
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.EmployeeSign, "EmployeeSign"),
    SIGN_RANGES.e,
    "EmployeeSign",
  );
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.AdminSign, "AdminSign"),
    SIGN_RANGES.admin,
    "AdminSign",
  );
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.ChiefAdminManageSign, "ChiefAdminManageSign"),
    SIGN_RANGES.chiefAdmin,
    "ChiefAdminManageSign",
  );
  addSignatureImage(
    workbook,
    sheet,
    resolveImagePath(purchase.ProjectDirectorSign, "ProjectDirectorSign"),
    SIGN_RANGES.pd,
    "ProjectDirectorSign",
  );

  // ---------- Items table ----------
  let totalRow = TOTAL_ROW_TEMPLATE;

  if (items.length > ITEMS_FIXED_ROWS) {
    // need more rows than the template has -> insert extras right above the total row,
    // cloning the style/number-format of the last fixed item row
    const extra = items.length - ITEMS_FIXED_ROWS;
    const templateRow = sheet.getRow(ITEMS_START_ROW + ITEMS_FIXED_ROWS - 1); // row 22

    for (let i = 0; i < extra; i++) {
      const insertAt = TOTAL_ROW_TEMPLATE + i;
      sheet.spliceRows(insertAt, 0, []);
      const newRow = sheet.getRow(insertAt);
      templateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        newRow.getCell(colNumber).style = cell.style;
        newRow.getCell(colNumber).numFmt = cell.numFmt;
      });
      newRow.height = templateRow.height;
      sheet.mergeCells(`C${insertAt}:J${insertAt}`);
    }
    totalRow = TOTAL_ROW_TEMPLATE + extra;
  }

  items.forEach((item, idx) => {
    const r = ITEMS_START_ROW + idx;
    sheet.getCell(`B${r}`).value = idx + 1;
    sheet.getCell(`C${r}`).value = item.ItemName;
    sheet.getCell(`K${r}`).value = item.Quantity;
    sheet.getCell(`L${r}`).value = item.Unit;
    sheet.getCell(`M${r}`).value = item.Claimable ? "Yes" : "No";
    sheet.getCell(`N${r}`).value = item.TypeOfExpenses;
    sheet.getCell(`O${r}`).value = item.Remarks;
    sheet.getCell(`P${r}`).value =
      item.UnitPrice != null ? Number(item.UnitPrice) : null;
    sheet.getCell(`Q${r}`).value = { formula: `K${r}*P${r}` }; // auto total per line
  });

  // blank out any leftover fixed rows if there are fewer than 6 items
  for (
    let r = ITEMS_START_ROW + items.length;
    r < ITEMS_START_ROW + ITEMS_FIXED_ROWS;
    r++
  ) {
    ["B", "C", "K", "L", "M", "N", "O", "P"].forEach((col) => {
      sheet.getCell(`${col}${r}`).value = null;
    });
    sheet.getCell(`Q${r}`).value = { formula: `K${r}*P${r}` };
  }

  // grand total stays a formula, range adjusted in case rows were inserted
  sheet.getCell(`Q${totalRow}`).value = {
    formula: `SUM(Q${ITEMS_START_ROW}:Q${totalRow - 1})`,
  };

  // keep Purchase.Total in the DB in sync with what's on the form (optional)
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
