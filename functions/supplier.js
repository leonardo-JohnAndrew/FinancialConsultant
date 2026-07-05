"use server";

import { Supplier } from "../db/models/index.js";

export async function getSuppliers() {
  const supplierName = await Supplier.findAll({
    attributes: ["supplierName", "supplierTin"],
  });

  return {
    data: supplierName.map((item) => item.toJSON()),
  };
}
