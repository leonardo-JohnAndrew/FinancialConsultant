/**
 * app/api/voucher-export/route.js
 *
 * GET /api/voucher-export?checkId=CHK-112
 *   → streams a merged Excel voucher workbook
 *
 * Frontend usage:
 *   <a href={`/api/voucher-export?checkId=${checkId}`} download>Export</a>
 *   or
 *   window.location.href = `/api/voucher-export?checkId=${checkId}`;
 */

import { NextResponse } from "next/server";

import { buildVoucherWorkbook } from "@/lib/Voucherexport";
import { Check, CheckItem } from "@/db/models"; // adjust to your actual model imports
import { convertXlsxBufferToPdf } from "@/lib/xlsxToPdf";

async function getCheckData(checkId) {
  const check = await Check.findOne({
    where: { id: checkId },
    include: [
      {
        model: CheckItem,
        as: "items",
        where: { parent_id: null },
        required: false,
        include: [
          {
            model: CheckItem,
            as: "children",
          },
        ],
      },
    ],
    order: [[{ model: CheckItem, as: "items" }, "slipNo", "ASC"]],
  });

  return check;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const checkId = searchParams.get("checkId");
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  if (!checkId) {
    return NextResponse.json({ error: "checkId is required" }, { status: 400 });
  }

  try {
    const check = await getCheckData(checkId);
    if (!check) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    //     return NextResponse.json({ check }, { status: 200 });

    const buffer = await buildVoucherWorkbook(check.toJSON());
    if (format === "pdf") {
      const pdfBuffer = await convertXlsxBufferToPdf(buffer, {
        baseName: `voucher-${checkId}`,
      });
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="voucher-${checkId}.pdf"`,
        },
      });
    }
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="voucher_${checkId}.xlsx"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("Voucher export error:", err);
    return NextResponse.json(
      { error: "Failed to generate voucher export", detail: err.message },
      { status: 500 },
    );
  }
}
