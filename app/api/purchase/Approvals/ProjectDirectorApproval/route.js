import { Purchase } from "@/db/models";
import { GetSpecificRequest } from "@/functions/purchase";
import { updateStatus } from "@/functions/status";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  return await GetSpecificRequest(
    "Project Director",
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
    const id = searchParams.get("PRID");
    const token = (await cookies()).get("token")?.value;
    const decoded = await verifyToken(token);
    const username = decoded.name;
    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return NextResponse.json(
        { error_message: "Record Not Found" },
        { status: 404 },
      );
    }

    // UPDATE
    await purchase.update({
      ProjectDirectorSign: body.e_sign,
      ProjectDirectorName: username,
    });
    // update Status
    await updateStatus("Accounting Submission", id);
    return NextResponse.json(
      { message: `You Approve Purchase Requisition: ${id}` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}
