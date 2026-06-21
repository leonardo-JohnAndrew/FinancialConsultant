import { NextResponse } from "next/server";

import { Summary, SummaryDetailed } from "@/db/models";

// GET single summary with its details
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const summary = await Summary.findByPk(id, {
      include: [{ model: SummaryDetailed, as: "summaryDetails" }],
    });

    if (!summary) {
      return NextResponse.json(
        { success: false, message: "Summary not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT update summary period range
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { projec_name, projec_code, period_start, period_end } = body;
    const summary = await Summary.findByPk(id);
    if (!summary) {
      return NextResponse.json(
        { success: false, message: "Summary not found" },
        { status: 404 },
      );
    }

    await Summary.update({
      projec_name,
      projec_code,
      period_start,
      period_end,
    });

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE summary
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const summary = await Summary.findByPk(id); // ← added await
    if (!summary) {
      return NextResponse.json(
        { success: false, message: "Summary not found" },
        { status: 404 },
      );
    }

    await SummaryDetailed.destroy({ where: { summary_id: id } });

    await summary.destroy(); // ← instance method, hindi na kailangan ng where

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
