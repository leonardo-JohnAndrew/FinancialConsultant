import { Purchase } from "@/db/models";
import { GetSpecificRequest } from "@/functions/purchase";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decode } from "node:punycode";

export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const approval = searchParams.get("approval") || "Admin";
  // return NextResponse.json(JSON.stringify(searchParams));
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  if (approval === "ChiefApproval") {
    return await GetSpecificRequest(
      "Chief Administrator Manager",
      searchParams.get("dateStart"),
      searchParams.get("dateEnd"),
      page,
      limit,
    );
  } else if (approval === "Admin") {
    return await GetSpecificRequest(
      "Admin",
      searchParams.get("dateStart"),
      searchParams.get("dateEnd"),
      page,
      limit,
    );
  } else {
    return NextResponse.json(
      { error_message: "UnAuthorized" },
      { status: 401 },
    );
  }
  a;
}
export async function POST(request) {
  try {
    const token = (await cookies()).get("token")?.value;
    const decoded = await verifyToken(token);
    const username = decoded.name;

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const body = await request.json();
    const id = searchParams.get("PRID");
    if (!body.e_sign) {
      return NextResponse.json({ error_message: "No e-sign" }, { status: 401 });
    }
    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return NextResponse.json(
        { error_message: "Record Not Found" },
        { status: 404 },
      );
    }
    //update
    await purchase.update({ AdminSign: body.e_sign, AdminName: username });
    return NextResponse.json(
      { message: `You Approved Purchase Requesition: ${id}` },
      { status: 200 },
    );
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}
