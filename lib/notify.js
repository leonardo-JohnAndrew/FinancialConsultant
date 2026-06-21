import { Notification } from "@/db/models";

export async function notify({
  userId,
  title,
  message,
  type = "info",
  link = null,
}) {
  await notification.create({ userId, title, message, type, link });
}

// Example usage in purchase approval API:
await notify({
  userId: requestorId,
  title: "Purchase Approved",
  message: `Your purchase requisition #${purchaseId} has been approved.`,
  type: "success",
  link: `/Main/Purchase/${purchaseId}`,
});
