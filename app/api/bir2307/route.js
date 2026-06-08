import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

const PAYOR = {
  tin: "000-484-418-00000",
  name: "ORIENTAL CONSULTANTS GLOBAL CO. LTD. - PHILIPPINE BRANCH",
  address:
    "UNIT 38C RUFINO PACIFIC TOWER, 6784 AYALA AVE., BRGY. SAN LORENZO, 4TH DIST., MAKATI CITY",
  zip: "1223",
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const THIN = { style: "thin", color: { argb: "FF888888" } };
const MEDIUM = { style: "medium", color: { argb: "FF000000" } };
const B_ALL = { top: THIN, left: THIN, bottom: THIN, right: THIN };

const FONT_SM = { name: "Arial Narrow", size: 8 };
const FONT_BASE = { name: "Arial Narrow", size: 9 };
const FONT_BOLD = { name: "Arial Narrow", size: 9, bold: true };
const FONT_TITL = { name: "Arial Narrow", size: 11, bold: true };
const FONT_FORM = { name: "Arial Narrow", size: 14, bold: true };
const FONT_WHT = (size = 9) => ({
  name: "Arial Narrow",
  size,
  bold: true,
  color: { argb: "FFFFFFFF" },
});

const FILL_HDRGRAY = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD6D6D6" },
};
const FILL_DKBLUE = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F4E79" },
};
const FILL_LTGRAY = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF5F5F5" },
};

const AMT_FMT = "#,##0.00";

// ── HELPERS ───────────────────────────────────────────────────────────────────
function ms(ws, r1, c1, r2, c2, value, opts = {}) {
  if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2);
  const cell = ws.getCell(r1, c1);
  cell.value = value ?? "";
  cell.font = opts.font ?? FONT_BASE;
  cell.alignment = {
    horizontal: opts.align ?? "left",
    vertical: "middle",
    wrapText: opts.wrap ?? true,
  };
  cell.border = opts.border ?? B_ALL;
  if (opts.fill) cell.fill = opts.fill;
  if (opts.numFmt) cell.numFmt = opts.numFmt;
  return cell;
}

function blueHdr(ws, r1, c1, r2, c2, value) {
  return ms(ws, r1, c1, r2, c2, value, {
    font: {
      name: "Arial Narrow",
      size: 9,
      bold: true,
      color: { argb: "FF000000" },
    },
    align: "center",
    fill: FILL_HDRGRAY,
    border: B_ALL,
    wrap: true,
  });
}

function sectionBar(ws, R, label) {
  ms(ws, R, 1, R, 10, label, {
    font: FONT_BOLD,
    align: "center",
    fill: FILL_HDRGRAY,
  });
  ws.getRow(R).height = 14;
}

function amtCell(ws, R, col, formula, bold = false) {
  const cell = ws.getCell(R, col);
  cell.value = { formula };
  cell.numFmt = AMT_FMT;
  cell.font = bold ? FONT_BOLD : FONT_BASE;
  cell.alignment = { horizontal: "right", vertical: "middle" };
  cell.border = B_ALL;
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
    } = body;

    const m1 = Number(month1) || 0;
    const m2 = Number(month2) || 0;
    const m3 = Number(month3) || 0;

    const wb = new ExcelJS.Workbook();
    wb.creator = "NSTREN";
    wb.created = new Date();

    const ws = wb.addWorksheet("BIR 2307", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.5,
          bottom: 0.5,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    // 10-column layout (mirrors HTML colSpan=10 grid)
    [3, 14, 14, 14, 10, 14, 14, 14, 14, 16].forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });

    let R = 1;

    // ── HEADER ────────────────────────────────────────────────────────────────
    ms(ws, R, 1, R, 1, "BCS/\nItem:", { font: FONT_SM });
    ms(
      ws,
      R,
      2,
      R,
      8,
      "Republic of the Philippines\nDepartment of Finance\nBureau of Internal Revenue",
      { font: FONT_TITL, align: "center" },
    );
    ms(ws, R, 9, R, 10, "2307 01/18ENCS", { font: FONT_SM, align: "right" });
    ws.getRow(R).height = 36;
    R++;

    ms(ws, R, 1, R, 4, "BIR Form No.\n2307\nJanuary 2018 (ENCS)", {
      font: FONT_BASE,
      align: "center",
    });
    ms(ws, R, 5, R, 10, "Certificate of Creditable Tax\nWithheld at Source", {
      font: FONT_FORM,
      align: "center",
    });
    ws.getRow(R).height = 42;
    R++;

    ms(
      ws,
      R,
      1,
      R,
      10,
      'Fill in all applicable spaces. Mark all appropriate boxes with an "X".',
      { font: FONT_SM },
    );
    ws.getRow(R).height = 12;
    R++;

    // ── PERIOD ────────────────────────────────────────────────────────────────
    ms(ws, R, 1, R, 1, "1", { font: FONT_BOLD });
    ms(
      ws,
      R,
      2,
      R,
      10,
      `For the Period   From: ${quarter.from}  (MM/DD/YYYY)     To: ${quarter.to}  (MM/DD/YYYY)`,
      { font: FONT_BASE },
    );
    ws.getRow(R).height = 14;
    R++;

    // ── PART I — PAYEE ────────────────────────────────────────────────────────
    sectionBar(ws, R, "Part I – Payee Information");
    R++;

    // Item 2 — TIN
    ms(ws, R, 1, R, 1, "2", { font: FONT_BOLD });
    ms(ws, R, 2, R, 10, "Taxpayer Identification Number (TIN)", {
      font: FONT_SM,
    });
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 10, supplier.supplierTin || "", { font: FONT_BASE });
    ws.getRow(R).height = 14;
    R++;

    // Item 3 — Payee Name
    ms(ws, R, 1, R, 1, "3", { font: FONT_BOLD });
    ms(
      ws,
      R,
      2,
      R,
      10,
      "Payee's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)",
      { font: FONT_SM },
    );
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 10, supplier.supplierName || "", { font: FONT_BOLD });
    ws.getRow(R).height = 14;
    R++;

    // Item 4 — Address
    ms(ws, R, 1, R, 1, "4", { font: FONT_BOLD });
    ms(ws, R, 2, R, 8, "Registered Address", { font: FONT_SM });
    ms(ws, R, 9, R, 10, "4A ZIP Code", { font: FONT_SM });
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 8, supplier.supplierAddress || "", { font: FONT_BASE });
    ms(ws, R, 9, R, 10, supplier.zipCode || "", {
      font: FONT_BASE,
      align: "center",
    });
    ws.getRow(R).height = 14;
    R++;

    // Item 5 — Foreign Address
    ms(ws, R, 1, R, 1, "5", { font: FONT_BOLD });
    ms(ws, R, 2, R, 10, "Foreign Address, if applicable", { font: FONT_SM });
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 10, supplier.foreignAddress || "", { font: FONT_BASE });
    ws.getRow(R).height = 14;
    R++;

    // ── PART II — PAYOR ───────────────────────────────────────────────────────
    sectionBar(ws, R, "Part II – Payor Information");
    R++;

    ms(ws, R, 1, R, 1, "6", { font: FONT_BOLD });
    ms(ws, R, 2, R, 10, "Taxpayer Identification Number (TIN)", {
      font: FONT_SM,
    });
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 10, PAYOR.tin, { font: FONT_BOLD });
    ws.getRow(R).height = 14;
    R++;

    ms(ws, R, 1, R, 1, "7", { font: FONT_BOLD });
    ms(
      ws,
      R,
      2,
      R,
      10,
      "Payor's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)",
      { font: FONT_SM },
    );
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 10, PAYOR.name, { font: FONT_BOLD });
    ws.getRow(R).height = 14;
    R++;

    ms(ws, R, 1, R, 1, "8", { font: FONT_BOLD });
    ms(ws, R, 2, R, 8, "Registered Address", { font: FONT_SM });
    ms(ws, R, 9, R, 10, "8A ZIP Code", { font: FONT_SM });
    ws.getRow(R).height = 12;
    R++;
    ms(ws, R, 1, R, 8, PAYOR.address, { font: FONT_BASE });
    ms(ws, R, 9, R, 10, PAYOR.zip, { font: FONT_BOLD, align: "center" });
    ws.getRow(R).height = 14;
    R++;

    // ── PART III — EWT TABLE ──────────────────────────────────────────────────
    sectionBar(
      ws,
      R,
      "Part III – Details of Monthly Income Payments and Taxes Withheld",
    );
    R++;

    // Header row 1
    blueHdr(
      ws,
      R,
      1,
      R + 1,
      4,
      "Income Payments Subject to Expanded Withholding Tax",
    );
    blueHdr(ws, R, 5, R + 1, 5, "ATC");
    blueHdr(ws, R, 6, R, 9, "AMOUNT OF INCOME PAYMENTS");
    blueHdr(ws, R, 10, R + 1, 10, "Tax Withheld for the Quarter");
    ws.getRow(R).height = 20;
    R++;

    // Header row 2
    blueHdr(ws, R, 6, R, 6, "1st Month\nof the Quarter");
    blueHdr(ws, R, 7, R, 7, "2nd Month\nof the Quarter");
    blueHdr(ws, R, 8, R, 8, "3rd Month\nof the Quarter");
    blueHdr(ws, R, 9, R, 9, "Total");
    ws.getRow(R).height = 26;
    R++;

    // Data row
    const DR = R;
    ms(ws, R, 1, R, 4, atcDescription, { font: FONT_SM });
    ms(ws, R, 5, R, 5, atcCode, { font: FONT_BOLD, align: "center" });

    const setAmt = (col, val) => {
      const cell = ws.getCell(R, col);
      cell.value = val;
      cell.numFmt = AMT_FMT;
      cell.font = FONT_BASE;
      cell.alignment = { horizontal: "right", vertical: "middle" };
      cell.border = B_ALL;
    };
    setAmt(6, m1);
    setAmt(7, m2);
    setAmt(8, m3);

    amtCell(ws, R, 9, `F${R}+G${R}+H${R}`, true);
    amtCell(ws, R, 10, `I${R}*${taxRate}`, true);
    ws.getRow(R).height = 40;
    R++;

    // 11 empty EWT rows
    for (let i = 0; i < 11; i++) {
      ms(ws, R, 1, R, 4, "");
      [5, 6, 7, 8, 9, 10].forEach((col) => {
        const cell = ws.getCell(R, col);
        cell.border = B_ALL;
        cell.value = "";
      });
      ws.getRow(R).height = 12;
      R++;
    }

    // EWT Total row
    ms(ws, R, 1, R, 4, "Total", { font: FONT_BOLD, fill: FILL_LTGRAY });
    ws.getCell(R, 5).border = B_ALL;
    ws.getCell(R, 5).fill = FILL_LTGRAY;
    [
      [6, "F"],
      [7, "G"],
      [8, "H"],
      [9, "I"],
      [10, "J"],
    ].forEach(([col, L]) => {
      amtCell(ws, R, col, `SUM(${L}${DR}:${L}${R - 1})`, true);
      ws.getCell(R, col).fill = FILL_LTGRAY;
    });
    ws.getRow(R).height = 14;
    R++;

    // // ── BUSINESS TAX TABLE ────────────────────────────────────────────────────
    // blueHdr(
    //   ws,
    //   R,
    //   1,
    //   R + 1,
    //   4,
    //   "Money Payments Subject to Withholding of Business Tax (Government & Private)",
    // );
    // blueHdr(ws, R, 5, R + 1, 5, "ATC");
    // blueHdr(ws, R, 6, R, 9, "AMOUNT OF MONEY PAYMENTS");
    // blueHdr(ws, R, 10, R + 1, 10, "Tax Withheld for the Quarter");
    // ws.getRow(R).height = 20;
    // R++;

    // blueHdr(ws, R, 6, R, 6, "1st Month\nof the Quarter");
    // blueHdr(ws, R, 7, R, 7, "2nd Month\nof the Quarter");
    // blueHdr(ws, R, 8, R, 8, "3rd Month\nof the Quarter");
    // blueHdr(ws, R, 9, R, 9, "Total");
    // ws.getRow(R).height = 26;
    // R++;

    // for (let i = 0; i < 3; i++) {
    //   ms(ws, R, 1, R, 4, "");
    //   [5, 6, 7, 8, 9, 10].forEach((col) => {
    //     ws.getCell(R, col).border = B_ALL;
    //     ws.getCell(R, col).value = "";
    //   });
    //   ws.getRow(R).height = 12;
    //   R++;
    // }

    // ms(ws, R, 1, R, 4, "Total", { font: FONT_BOLD, fill: FILL_LTGRAY });
    // [5, 6, 7, 8, 9, 10].forEach((col) => {
    //   ws.getCell(R, col).border = B_ALL;
    //   ws.getCell(R, col).fill = FILL_LTGRAY;
    // });
    // ws.getRow(R).height = 14;
    // R++;

    // ── DECLARATION ───────────────────────────────────────────────────────────
    ms(
      ws,
      R,
      1,
      R,
      10,
      "   We declare under the penalties of perjury that this certificate has been made in good faith, verified by us, and to the best of our knowledge and belief, is true and correct, pursuant to the provisions of the National Internal Revenue Code, as amended, and the regulations issued under authority thereof. Further, we give our consent to the processing of our information as contemplated under the Data Privacy Act of 2012 (R.A. No. 10173) for legitimate and lawful purposes.",
      { font: FONT_SM },
    );
    ws.getRow(R).height = 36;
    R++;

    // ── PAYOR SIGNATURE ───────────────────────────────────────────────────────
    ms(
      ws,
      R,
      1,
      R,
      10,
      "ELSA G. OCRETO\nASSISTANT GENERAL MANAGER, FINANCE & ACCOUNTING / TIN 119-839-069",
      { font: FONT_BASE },
    );
    ws.getRow(R).height = 40;
    R++;

    const sp = ms(
      ws,
      R,
      1,
      R,
      10,
      "Signature over Printed Name of Payor/Payor's Authorized Representative/Tax Agent",
      { font: FONT_SM, border: null },
    );
    sp.border = { top: MEDIUM, left: THIN, right: THIN, bottom: THIN };
    ws.getRow(R).height = 12;
    R++;

    ms(ws, R, 1, R, 10, "(Indicate Title/Designation and TIN)", {
      font: FONT_SM,
    });
    ws.getRow(R).height = 12;
    R++;

    ms(ws, R, 1, R, 4, "Tax Agent Accreditation No./", { font: FONT_SM });
    ms(ws, R, 5, R, 7, "Date of Issue\n(MM/DD/YYYY)", {
      font: FONT_SM,
      align: "center",
    });
    ms(ws, R, 8, R, 10, "Date of Expiry\n(MM/DD/YYYY)", {
      font: FONT_SM,
      align: "center",
    });
    ws.getRow(R).height = 22;
    R++;

    ms(ws, R, 1, R, 10, "Attorney's Roll No. (if applicable)", {
      font: FONT_SM,
    });
    ws.getRow(R).height = 12;
    R++;

    // ── CONFORME ──────────────────────────────────────────────────────────────
    ms(ws, R, 1, R, 10, "CONFORME:", { font: FONT_BOLD });
    ws.getRow(R).height = 12;
    R++;

    ms(ws, R, 1, R, 10, "");
    ws.getRow(R).height = 50;
    R++;

    const sc = ms(
      ws,
      R,
      1,
      R,
      10,
      "Signature over Printed Name of Payee/Payee's Authorized Representative/Tax Agent",
      { font: FONT_SM, border: null },
    );
    sc.border = { top: MEDIUM, left: THIN, right: THIN, bottom: THIN };
    ws.getRow(R).height = 12;
    R++;

    ms(ws, R, 1, R, 10, "(Indicate Title/Designation and TIN)", {
      font: FONT_SM,
    });
    ws.getRow(R).height = 12;
    R++;

    ms(ws, R, 1, R, 4, "Tax Agent Accreditation No./", { font: FONT_SM });
    ms(ws, R, 5, R, 7, "Date of Issue\n(MM/DD/YYYY)", {
      font: FONT_SM,
      align: "center",
    });
    ms(ws, R, 8, R, 10, "Date of Expiry\n(MM/DD/YYYY)", {
      font: FONT_SM,
      align: "center",
    });
    ws.getRow(R).height = 22;
    R++;

    ms(ws, R, 1, R, 10, "Attorney's Roll No. (if applicable)", {
      font: FONT_SM,
    });
    ws.getRow(R).height = 12;
    R++;

    // ── FOOTER ────────────────────────────────────────────────────────────────
    R++;
    const note = ws.getCell(R, 1);
    ws.mergeCells(R, 1, R, 10);
    note.value =
      "*NOTE: The BIR Data Privacy is in the BIR website (www.bir.gov.ph)";
    note.font = { name: "Arial Narrow", size: 8, italic: true };
    note.alignment = { horizontal: "left" };

    const buffer = await wb.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="BIR2307_${supplier.supplierName || "export"}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("BIR2307 Error:", error.message);
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}
