"use server";
import { Notification, User } from "../db/models/index.js";
require("dotenv").config();
import nodemailer from "nodemailer";
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
        const createApprove = await createNotification(
          account.userID,
          notification,
        );
        if (createApprove === false) {
          return false;
        }
      }
    }
    return true;
  } catch (err) {
    return false;
  }
}

// transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// create notification  function next Approval Stage
export async function createNextApprovalNotification(
  current = " ",
  position,
  PRCODE,
) {
  // Admin , Chief and ProjectDirector
  try {
    const user = await User.findOne({
      where: {
        position: position,
      },
    });

    if (user) {
      if (current === "Accountant") {
        createNotification(
          user.userID,
          `${current} confirm budget for Purchase Requisition ${PRCODE}`,
        );
      } else {
        createNotification(
          user.userID,
          `${current} approve a Purchase Requisition ${PRCODE}`,
        );
      }
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function createNotification(receiver, notification, email) {
  // await
  const payload = {
    notification: notification,
    message: notification,
    title: "Purchase Requisition",
    userID: receiver,
  };
  // find user email
  const userEmail = await User.findOne({
    where: {
      userID: receiver,
    },
    attributes: ["email"],
  });

  //send
  try {
    const notify = await Notification.create(payload);
    await transporter.sendMail({
      from: `"FINANCIAL CONSULTANT SYSTEM" <${process.env.EMAIL_USER}`,
      to: userEmail.email,
      subject: "New Notification - FINANCIAL CONSULTANT SYSTEM",
      html: `
       <div>
         <p>${notification}</p>
        <div/>
      `,
    });
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

// find all userRole
export async function findSpecificRole() {
  const user = User.findOne({
    where: {},
  });
}
// department
