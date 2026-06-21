import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { Creditor } from "@/db/models";

const REQUIRED = ["code", "creditorsName"];
const OPTIONAL = [
  "address1",
  "address2",
  "city",
  "country",
  "tin1",
  "tin2",
  "tin3",
];
const ALL_COLS = [...REQUIRED, ...OPTIONAL];

function toNullable(val) {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  return str === "" ? null : str;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const isExcel =
      file.type.includes("spreadsheet") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isExcel) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an .xlsx or .xls file." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      return NextResponse.json(
        { error: "Excel file is empty." },
        { status: 400 },
      );
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-based + header row

      const code = toNullable(row["code"]);
      const creditorsName = toNullable(row["creditorsName"]);

      // Skip rows missing required fields
      if (!code || !creditorsName) {
        skipped++;
        errors.push(
          `Row ${rowNum}: Missing required field(s) — ${!code ? "code" : ""}${!code && !creditorsName ? ", " : ""}${!creditorsName ? "creditorsName" : ""}.`,
        );
        continue;
      }

      // Skip duplicate codes
      const exists = await Creditor.findByPk(code);
      if (exists) {
        skipped++;
        errors.push(`Row ${rowNum}: Code "${code}" already exists — skipped.`);
        continue;
      }

      try {
        await Creditor.create({
          code,
          creditorsName,
          address1: toNullable(row["address1"]),
          address2: toNullable(row["address2"]),
          city: toNullable(row["city"]),
          country: toNullable(row["country"]) ?? "PH",
          tin1: toNullable(row["tin1"]),
          tin2: toNullable(row["tin2"]),
          tin3: toNullable(row["tin3"]),
        });
        created++;
      } catch (err) {
        skipped++;
        errors.push(`Row ${rowNum}: Failed to save — ${err.message}`);
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (err) {
    console.error("POST /api/creditors/import error:", err);
    return NextResponse.json(
      { error: "Import failed. Please check your file and try again." },
      { status: 500 },
    );
  }
}
