import { NextResponse } from "next/server";
import sequelize from "@/db/connection";
import { Role } from "@/db/models";

// GET all roles
export async function GET() {
  try {
    await sequelize.sync();
    const roles = await Role.findAll({ order: [["name", "ASC"]] });
    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — add a role
export async function POST(req) {
  try {
    await sequelize.sync();
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const existing = await Role.findOne({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json(
        { error: "Role already exists." },
        { status: 409 },
      );
    }

    const role = await Role.create({ name: name.trim() });
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — remove a role by name (query param)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    await Role.destroy({ where: { name: name.trim() } });
    return NextResponse.json({ message: "Deleted." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
