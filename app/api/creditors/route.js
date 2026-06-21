import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { Creditor } from "@/db/models";

// GET /api/creditors
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const offset = (page - 1) * limit;
    const search = searchParams.get("search")?.trim();

    const where =
      search ?
        {
          [Op.or]: [
            { code: { [Op.like]: `%${search}%` } },
            { creditorsName: { [Op.like]: `%${search}%` } },
            { city: { [Op.like]: `%${search}%` } },
            { tin1: { [Op.like]: `%${search}%` } },
            { tin2: { [Op.like]: `%${search}%` } },
            { tin3: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Creditor.findAndCountAll({
      where,
      limit,
      offset,
      order: [["code", "ASC"]],
    });

    return NextResponse.json({
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error("GET /api/creditors error:", err);
    return NextResponse.json(
      { error: "Failed to fetch creditors." },
      { status: 500 },
    );
  }
}

// POST /api/creditors
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code,
      creditorsName,
      address1,
      address2,
      city,
      country,
      tin1,
      tin2,
      tin3,
    } = body;

    if (!code)
      return NextResponse.json({ error: "Code is required." }, { status: 400 });
    if (!creditorsName)
      return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const creditor = await Creditor.create({
      code,
      creditorsName,
      address1,
      address2,
      city,
      country,
      tin1: tin1 ?? null,
      tin2: tin2 ?? null,
      tin3: tin3 ?? null,
    });

    return NextResponse.json(creditor, { status: 201 });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { error: "Code or TIN already exists." },
        { status: 409 },
      );
    }
    console.error("POST /api/creditors error:", err);
    return NextResponse.json(
      { error: "Failed to create creditor." },
      { status: 500 },
    );
  }
}
