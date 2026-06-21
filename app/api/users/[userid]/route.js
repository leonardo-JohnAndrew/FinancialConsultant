import { NextResponse } from "next/server";
import { changePassword } from "@/functions/userfunctions";
export async function PATCH(req, { params }) {
  try {
    const { userid } = await params;

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());

    //   Only allow safe fields to be updated
    const allowedFields = [
      "firstname",
      "lastname",
      "email",
      "role",
      "department",
      "position",
      "mustChangePassword",
    ];
    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== "") {
        updateData[field] = body[field];
      }
    }

    //   Only hash & update password if provided
    if (body.password && body.password.trim() !== "") {
      const bcrypt = require("bcrypt");
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const [rowsAffected] = await User.update(updateData, {
      where: { userID: userid },
    });

    if (rowsAffected === 0) {
      return NextResponse.json(
        { error_message: "User not found or nothing changed" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Updated OK" }, { status: 200 });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// change password endpoint
export async function POST(req, { params }) {
  try {
    const { userid } = await params;
    const body = await req.json();
    if (!body.newpassword || body.newpassword.trim() === "") {
      return NextResponse.json(
        { error_message: "New password is required" },
        { status: 400 },
      );
    }
    // call the changePassword function from userfunctions.js
    await changePassword(userid, body.newpassword);
    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
