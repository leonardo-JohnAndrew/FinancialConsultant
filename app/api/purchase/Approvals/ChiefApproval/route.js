import sequelize from "@/db/connection";
import { Purchase, PurchaseItems, User } from "@/db/models";
import { NextResponse } from "next/server";
import { GetSpecificRequest } from "@/functions/purchase";
import { decode } from "node:punycode";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
export async function GET(request) {
  // create a end points , to get all purchase requisition that are pending for chief approval
  // condition :  ChiefAdminManage Sign Null and ProjectDirectorSign Null
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  // const offset = (page - 1) * limit; // skip page
  return await GetSpecificRequest(
    "Chief Administrator Manager",
    searchParams.get("dateStart"),
    searchParams.get("dateEnd"),
    page,
    limit,
  );
}

// post
export async function POST(request) {
  try {
    const token = (await cookies()).get("token")?.value;
    const decoded = await verifyToken(token);
    const username = decoded.name;
    const isAdmin = decode.role === "Admin";
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const body = await request.json();
    const id = searchParams.get("PRID");

    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return NextResponse.json(
        { error_message: "Record Not Found" },
        { status: 404 },
      );
    }

    // UPDATE
    await purchase.update({
      ChiefAdminManageSign: body.e_sign,
      isAdminForChiefSign: isAdmin,
      ChiefAdminManagerName: username,
    });
    return NextResponse.json(
      { message: `You Approve Purchase Requisition: ${id}` },
      { status: 200 },
    );
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}
