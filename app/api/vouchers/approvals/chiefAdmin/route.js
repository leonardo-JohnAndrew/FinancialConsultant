import { Check } from "@/db/models";
import { GetFilterizeVoucher } from "@/functions/vouchers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  return await GetFilterizeVoucher(
    "Chief Admin",
    searchParams.get("dateStart"),
    searchParams.get("dateEnd"),
    page,
    limit,
  );
}
export async function POST(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const body = await request.json();
    const id = searchParams.get("VRID");

    const voucher = await Check.findByPk(id);
    if (!voucher) {
      // 404
      return NextResponse.json(
        { error_message: "Record Not Found" },
        { status: 404 },
      );
    }
    await voucher.update({ ChiefAdminSignature: body.e_sign });

    // adding in the cashbooks
    // parents table cashbook
    // field  { PROJECT , CURRENCY , ID , CASHBOOKTYPE }
    // ADD IN Child or the designated CASHBOOKTYPE
    return NextResponse.json({ message: `You Approve Voucher` });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
