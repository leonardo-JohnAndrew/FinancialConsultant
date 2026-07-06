/**
 * app/api/purchases/[id]/export/route.js
 *
 * Next.js (App Router) API route — GET /api/purchases/:id/export
 * Returns the filled PRFORM.xlsx as a downloadable file.
 *
 * IMPORTANT: exceljs + fs need the Node.js runtime, not Edge.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { exportPurchaseToExcel } from "@/app/services/purchaseExportService"; // adjust alias/path to your project
import { convertXlsxBufferToPdf } from "@/lib/xlsxToPdf";

export async function GET(request, { params }) {
  const { purchaseid } = await params;
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  try {
    const buffer = await exportPurchaseToExcel(purchaseid);

    if (format === "pdf") {
      const pdfBuffer = await convertXlsxBufferToPdf(buffer, {
        baseName: "summary",
      });
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="summary.pdf"`,
        },
      });
    }
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="PR-${purchaseid}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Export PR failed:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
