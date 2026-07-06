import { Check } from "@/db/models";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { voucherId } = await params;

  try {
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error_message: "Rejection reason is required." },
        { status: 400 },
      );
    }

    await Check.update(
      {
        isRejected: true,
        Reason: reason.trim(), // kailangan may column na ito sa model
      },
      { where: { id: voucherId } },
    );

    return NextResponse.json({ message: "Voucher Rejected" }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
