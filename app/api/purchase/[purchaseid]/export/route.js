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

export async function GET(request, { params }) {
  const { purchaseid } = await params;

  try {
    const buffer = await exportPurchaseToExcel(purchaseid);

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
