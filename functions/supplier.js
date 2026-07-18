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

//add to suppliers
//supplierName , supplierAddress and zipCode , supplierTin
export async function addSuppliers({
  supplierName,
  supplierAddress,
  zipCode,
  supplierTin,
}) {
  try {
    if (supplierTin) {
      const supplier = await Supplier.findAll({
        where: { supplierTin: supplierTin },
        attributes: ["id"],
      });
      if (supplier.length > 0) {
        return {
          error_message: "Supplier is exist",
        };
      }
    }

    await Supplier.create({
      supplierName,
      supplierAddress,
      zipCode,
      supplierTin,
    });

    return {
      message: "Successfully Added",
    };
  } catch (err) {
    console.error("Supplier create error:", err); // full object
    if (err.name === "SequelizeValidationError") {
      console.error(
        "Validation details:",
        err.errors.map((e) => ({
          field: e.path,
          message: e.message,
          value: e.value,
        })),
      );
    }
    return {
      error_message: err.errors?.[0]?.message || err.message,
    };
  }
}
