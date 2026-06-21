// import sequelize from "@/db/connection";
// import { User } from "@/db/models";
// import { validationRequiredFields } from "@/functions/validations";
// import { NextResponse } from "next/server";
// import bcrypt from "bcrypt";
// import { generatUserID } from "@/functions/autogenerate";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// //   CREATE USER
// export async function POST(request) {
//   try {
//     await sequelize.sync();

//     const formData = await request.formData();
//     const user = Object.fromEntries(formData.entries());

//     console.log("USER:", user);

//     //   Handle e_signature file upload
//     const signatureFile = formData.get("e_signature");
//     if (
//       signatureFile &&
//       signatureFile instanceof File &&
//       signatureFile.size > 0
//     ) {
//       const buffer = Buffer.from(await signatureFile.arrayBuffer());
//       const uploadDir = path.join(
//         process.cwd(),
//         "public",
//         "uploads",
//         "signatures",
//       );
//       await mkdir(uploadDir, { recursive: true });
//       const filename = `${Date.now()}-${signatureFile.name}`;
//       await writeFile(path.join(uploadDir, filename), buffer);
//       user.e_signature = `/uploads/signatures/${filename}`;
//     } else {
//       delete user.e_signature;
//     }

//     if (!user.password || user.password.trim() === "") {
//       user.password = "Default@123";
//     }

//     const requiredFields = [
//       "lastname",
//       "firstname",
//       "department",
//       "position",
//       "role",
//     ];
//     const validation = await validationRequiredFields(requiredFields, [user]);

//     if (validation && Object.keys(validation).length > 0) {
//       return NextResponse.json({ error_message: validation }, { status: 400 });
//     }

//     const hashedPassword = await bcrypt.hash(user.password, 10);
//     const userID = await generatUserID(user.lastname);

//     const created = await User.create({
//       ...user,
//       userID,
//       password: hashedPassword,
//       status: "Active",
//     });

//     return NextResponse.json({ created }, { status: 201 });
//   } catch (error) {
//     console.error("❌ POST ERROR:", error.message);
//     console.error("❌ FULL ERROR:", JSON.stringify(error, null, 2));
//     return NextResponse.json({ error_message: error.message }, { status: 500 });
//   }
// }

// //   GET USERS
// export async function GET() {
//   try {
//     await sequelize.sync();
//     const users = await User.findAll({
//       attributes: { exclude: ["password"] },
//     });
//     return NextResponse.json({ users }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error_message: error.message }, { status: 500 });
//   }
// }
import sequelize from "@/db/connection";
import { User } from "@/db/models";
import { validationRequiredFields } from "@/functions/validations";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sendWelcomeEmail } from "@/lib/sendWelcomeEmail"; // ← ADD
import { writeFile, mkdir } from "fs/promises";
import path from "path";

//   CREATE USER
export async function POST(request) {
  try {
    await sequelize.sync();

    const formData = await request.formData();
    const user = Object.fromEntries(formData.entries());

    console.log("USER:", user);

    // ── Manual userID validation ─────────────────────────────────
    if (!user.userID || user.userID.trim() === "") {
      return NextResponse.json(
        { error_message: { userID: "User ID is required." } },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({
      where: { userID: user.userID.trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error_message: { userID: "User ID already exists." } },
        { status: 409 },
      );
    }
    // ─────────────────────────────────────────────────────────────

    //   Handle e_signature file upload
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
      user.e_signature = `/uploads/signatures/${filename}`;
    } else {
      delete user.e_signature;
    }

    // ── Default password ─────────────────────────────────────────
    const defaultPassword =
      !user.password || user.password.trim() === "" ?
        "Default@123"
      : user.password;
    // ─────────────────────────────────────────────────────────────

    const requiredFields = [
      "lastname",
      "firstname",
      "department",
      "position",
      "role",
    ];
    const validation = await validationRequiredFields(requiredFields, [user]);

    if (validation && Object.keys(validation).length > 0) {
      return NextResponse.json({ error_message: validation }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    // ❌ REMOVE: const userID = await generatUserID(user.lastname);

    const created = await User.create({
      ...user,
      userID: user.userID.trim(),
      password: hashedPassword,
      status: "Active",
      mustChangePassword: true,
    });

    // ── Send welcome email ───────────────────────────────────────
    if (user.email) {
      try {
        await sendWelcomeEmail({
          toEmail: user.email,
          userID: user.userID.trim(),
          defaultPassword,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        });
      } catch (emailErr) {
        console.warn("⚠️ Email failed but user was created:", emailErr.message);
      }
    }
    // ─────────────────────────────────────────────────────────────

    return NextResponse.json({ created }, { status: 201 });
  } catch (error) {
    console.error("❌ POST ERROR:", error.message);
    console.error("❌ FULL ERROR:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}

//   GET USERS
export async function GET() {
  try {
    await sequelize.sync();
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error_message: error.message }, { status: 500 });
  }
}
