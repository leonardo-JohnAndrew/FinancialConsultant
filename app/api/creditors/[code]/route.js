import { NextResponse } from "next/server";
import { Creditor } from "@/db/models";

// GET single
export async function GET(request, { params }) {
  const { code } = await params;
  const creditor = await Creditor.findByPk(code);

  if (!creditor) {
    return NextResponse.json({ error: "Creditor not found." }, { status: 404 });
  }

  return NextResponse.json(creditor);
}

// UPDATE
export async function PUT(request, { params }) {
  const { code } = await params;
  const creditor = await Creditor.findByPk(code);

  if (!creditor) {
    return NextResponse.json(
      { error: `Creditor ${code} not found` },
      { status: 404 },
    );
  }

  const body = await request.json();

  await creditor.update({
    creditorsName: body.creditorsName,
    address1: body.address1,
    address2: body.address2,
    city: body.city,
    country: body.country,
    tin1: body.tin1 ?? null,
    tin2: body.tin2 ?? null,
    tin3: body.tin3 ?? null,
  });

  return NextResponse.json(creditor);
}

// DELETE
export async function DELETE(request, { params }) {
  const { code } = await params;
  console.log("DELETE hit, code:", JSON.stringify(code));

  const creditor = await Creditor.findByPk(code);
  console.log("findByPk result:", creditor ? "FOUND" : "NULL");

  if (!creditor) {
    return NextResponse.json({ error: "Creditor not found." }, { status: 404 });
  }

  await creditor.destroy();
  return NextResponse.json({ message: "Creditor deleted." });
}