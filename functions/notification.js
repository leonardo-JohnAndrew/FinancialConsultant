"use server";
import { Notification, User } from "../db/models/index.js";

// notification all accounting
export async function accountingNofication(status, PRCODE, requestor) {
  let notification = "";
  // selction
  switch (status) {
    case "Approved":
      notification = `Purchase Requisition ${PRCODE} from ${requestor} is Already Approved by Chief Administrator and Project Director`;
      break;
    case "Budget Confirmation":
      notification = `${requestor} create a Purchase Requisition`;
      break;
    default:
      break;
  }

  // create notification
  // find all the account
  try {
    const accountant = await User.findAll({
      where: {
        department: "Accounting",
      },
    });
    if (accountant.length > 0) {
      for (const account of accountant) {
        await createNotification(account.userID, notification);
      }
    }
  } catch (err) {
    return false;
  }
}

// create notification  function next Approval Stage
export async function createNextApprovalNotification(
  position,
  approvalName,
  PRCODE,
) {
  // Admin , Chief and ProjectDirector
  try {
    const user = await User.findOne({
      where: {
        position: position,
      },
    });

    if (user.length) {
      createNotification(
        user.userID,
        `${approvalName} approve a Purchase Requisition ${PRCODE}`,
      );
    }
  } catch (err) {
    return false;
  }
}
export async function createNotification(receiver, notification) {
  // await
  const payload = {
    notification: notification,
    userID: receiver,
  };

  try {
    const notify = await Notification.create(payload);
    return true;
  } catch (err) {
    return false;
  }
}
