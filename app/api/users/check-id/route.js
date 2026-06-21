import { User } from "@/db/models";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get("userID");

    if (!userID || userID.trim() === "") {
      return NextResponse.json({ taken: false }, { status: 200 });
    }

    const existing = await User.findOne({
      where: { userID: userID.trim() },
    });

    return NextResponse.json({ taken: !!existing }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
