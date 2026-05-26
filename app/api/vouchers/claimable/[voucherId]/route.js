import { Check } from "@/db/models";
import { NextResponse } from "next/server";
export async function PUT(request, { params }) {
  const { voucherId } = await params;
  const body = await request.json();
  const { claimable } = body;
  try {
    // make api call to update claimable status
    await Check.update(
      { claimable: claimable },
      {
        where: {
          id: voucherId,
        },
      },
    );

    // Optionally, you can return the updated voucher or a success message
    return NextResponse.json(
      { message: "Claimable status updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating claimable status:", error);
    return NextResponse.json(
      { error_message: "Failed to update claimable status" },
      { status: 500 },
    );
  }
}
