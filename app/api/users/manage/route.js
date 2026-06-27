import { User } from "@/db/models";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { writeFile, mkdir } from "fs/promises";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";
import path from "path";

// UPDATE USER (fields + status toggle)
export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userid = searchParams.get("id");
    console.log("PATCH userid:", userid);

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const updateData = {};

    // ── STATUS TOGGLE (enable/disable) ──────────────────────────
    // If only status is being changed (e.g. from the toggle button),
    // we skip the other field processing and just update status.
    if (body.status && Object.keys(body).length === 1) {
      const allowedStatuses = ["Active", "Inactive"];
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value." },
          { status: 400 },
        );
      }

      await User.update(
        { status: body.status },
        { where: { userID: userid.trim() } },
      );
      return NextResponse.json({ message: "Status updated." }, { status: 200 });
    }
    // ─────────────────────────────────────────────────────────────

    // Handle e_signature file upload
    const signatureFile = formData.get("e_signature");
    if (
      signatureFile &&
      signatureFile instanceof File &&
      signatureFile.size > 0
    ) {
      const buffer = Buffer.from(await signatureFile.arrayBuffer());
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "signatures",
      );
      await mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${signatureFile.name}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      updateData.e_signature = `/uploads/signatures/${filename}`;
    }

    const allowedFields = [
      "userID",
      "firstname",
      "lastname",
      "email",
      "role",
      "department",
      "position",
      "status",
      "mustChangePassword",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== "") {
        updateData[field] = body[field];
      }
    }

    if (body.password && body.password.trim() !== "") {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // Coerce mustChangePassword string → boolean
    if (updateData.mustChangePassword !== undefined) {
      updateData.mustChangePassword =
        updateData.mustChangePassword === "false" ? false : true;
    }

    await User.update(updateData, {
      where: { userID: userid.trim() },
    });

    // RE-FETCH updated user para sa bagong token
    const updatedUser = await User.findByPk(userid.trim());

    // REFRESH TOKEN
    const newToken = await signToken({
      id: updatedUser.userID,
      userID: updatedUser.userID,
      role: updatedUser.role,
      profile: updatedUser.profile_pic,
      department: updatedUser.department,
      e_sign: updatedUser.e_signature,
      mustChangePassword: updatedUser.mustChangePassword ?? false,
      name: `${updatedUser.lastname}, ${updatedUser.firstname} ${
        (
          !updatedUser.middle ||
          updatedUser.middle === "N/A" ||
          updatedUser.middle === null
        ) ?
          ""
        : updatedUser.middle
      }`,
    });

    (await cookies()).set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ message: "Updated OK" }, { status: 200 });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PERMANENT DELETE
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userid = searchParams.get("id");
    console.log("DELETE userid:", userid);

    await User.destroy({ where: { userID: userid.trim() } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
