import { verifyToken } from "@/lib/auth";
import { Notification } from "@/db/models";
import { Op } from "sequelize";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  const user = await verifyToken(token);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    start(controller) {
      const send = (data) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      // ping every 25s para hindi mag-timeout ang connection
      const ping = setInterval(() => send({ type: "ping" }), 25000);

      // i-poll ang DB every 5s, i-push kung may bago
      let lastCheck = new Date();
      const check = setInterval(async () => {
        const newNotifs = await Notification.findAll({
          where: { userId: user.id, createdAt: { [Op.gt]: lastCheck } },
          order: [["createdAt", "DESC"]],
        });
        lastCheck = new Date();
        if (newNotifs.length > 0)
          send({ type: "new", notifications: newNotifs });
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(ping);
        clearInterval(check);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
