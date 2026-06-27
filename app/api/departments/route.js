import { NextResponse } from "next/server";
import sequelize from "@/db/connection";
import { Departments } from "@/db/models";

export async function GET() {
  try {
    await sequelize.sync();
    const departments = await Departments.findAll({
      order: [["dprtName", "ASC"]],
    });
    return NextResponse.json(
      {
        departments: departments.map((d) => ({ name: d.dprtName })), // ← map to "name" para consistent sa frontend
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    const existing = await Departments.findOne({
      where: { dprtName: name.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Department already exists." },
        { status: 409 },
      );
    }
    await Departments.create({ dprtName: name.trim() });
    return NextResponse.json({ message: "Created." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    await Departments.destroy({ where: { dprtName: name.trim() } });
    return NextResponse.json({ message: "Deleted." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
