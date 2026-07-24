import { Purchase } from "@/db/models";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  const { purchaseid } = await params;
  const body = await request.json();
  const { reason } = body;
  // update make purchase cancel
  try {
    await Purchase.update(
      {
        isCancel: true,
        Status: "Cancel Purchase Requisition",
      },
      {
        where: { PurchaseID: purchaseid },
      },
    );
    return NextResponse.json({ message: "Request Cancel" }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ error_messsage: err.message }, { status: 500 });
  }
}
export async function POST(request, { params }) {
  const { purchaseid } = await params;
  try {
    const body = await request.json();
    const reason = body.reason || "not in budget";
    // update mak e purchase cancel
    await Purchase.update(
      {
        reason,
        isRejected: true,
        Status: "Rejected Purchase Requisition",
      },
      {
        where: { PurchaseID: purchaseid },
      },
    );
    return NextResponse.json({ message: "Request Rejected" }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ error_messsage: err.message }, { status: 500 });
  }
}
