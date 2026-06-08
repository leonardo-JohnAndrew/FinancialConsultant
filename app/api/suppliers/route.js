import { Supplier } from "@/db/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const suppliers = await Supplier.findAll();
    return NextResponse.json(suppliers, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
