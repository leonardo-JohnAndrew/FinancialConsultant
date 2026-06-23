import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { Notification } from "@/db/models";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = await verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await Notification.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, title, message, type, link } = body;
    const notif = await Notification.create({
      userID: userId,
      title,
      message,
      type,
      link,
    });
    return NextResponse.json({ notification: notif }, { status: 201 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
