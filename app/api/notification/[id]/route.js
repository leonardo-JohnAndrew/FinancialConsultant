import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { Notification } from "@/db/models";

export async function PATCH(req, { params }) {
  const { id } = await params; // ← destructure ONCE, use `id` na
  try {
    const token = req.cookies.get("token")?.value;
    const user = await verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await Notification.update(
      { isRead: true },
      { where: { id, userId: user.id } }, // ← `id` hindi `params.id`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
