import { Purchase, PurchaseItems } from "@/db/models";
import { NextResponse } from "next/server";
// adjust path/name kung iba

export async function GET(request, { params }) {
  const { voucherId } = await params;

  try {
    const purchases = await Purchase.findAll({
      where: { id: voucherId },
      include: [
        {
          model: PurchaseItems,
        },
      ],
      order: [["timeStamp", "DESC"]],
    });

    return NextResponse.json({ data: purchases }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}

// remove PR from this voucher (balik sa "approved, unattached" pool)
export async function PATCH(request, { params }) {
  const { voucherId } = await params;

  try {
    const body = await request.json();
    const { PurchaseID } = body;

    if (!PurchaseID) {
      return NextResponse.json(
        { error_message: "PurchaseID is required" },
        { status: 400 },
      );
    }

    const [updatedCount] = await Purchase.update(
      { id: null },
      { where: { PurchaseID, id: voucherId } },
    );

    if (updatedCount === 0) {
      return NextResponse.json(
        { error_message: "PR not found on this voucher" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Removed from voucher" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}

// attach an approved PR to this voucher
export async function POST(request, { params }) {
  const { voucherId } = await params;

  try {
    const body = await request.json();
    const { PurchaseID } = body;

    if (!PurchaseID) {
      return NextResponse.json(
        { error_message: "PurchaseID is required" },
        { status: 400 },
      );
    }

    // dapat unattached pa lang (id === null) para hindi ma-steal sa ibang voucher
    const [updatedCount] = await Purchase.update(
      { id: voucherId },
      { where: { PurchaseID, id: null } },
    );

    if (updatedCount === 0) {
      return NextResponse.json(
        { error_message: "PR is already attached to a voucher or not found" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Attached to voucher" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
