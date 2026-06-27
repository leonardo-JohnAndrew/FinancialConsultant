import sequelize from "../../connection.js";
import { Role, Departments } from "../index.js";

const DEFAULT_ROLES = [
  "Regular Employee",
  "Admin",
  "Accounting",
  "Chief Accountant",
  "Chief Administrator Manager",
  "Project Director",
  "SuperAdmin",
];

const DEFAULT_DEPARTMENTS = [
  "IT Department",
  "Depot Civil",
  "Utilities",
  "Geotechnical Station",
  "Bldg Engineering Viaducts & Bridges",
  "Civil Design",
  "Environmental",
  "Rolling Stock",
  "S&T Group",
  "E&M Group",
  "Cad",
  "Cost Control & Estimation",
  "Project Administration",
  "Accounting Office",
  "Architecture & Building",
  "Quality Assurance & Quality Control",
  "Document Controller",
  "Contract & Financial",
  "Project Manager 1",
  "Project Manager 2",
  "Project Director",
  "Deputy Project",
  "Reception",
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected.");

    // ── Roles ─────────────────────────────────────────────────
    let rolesAdded = 0;
    let rolesSkipped = 0;

    for (const name of DEFAULT_ROLES) {
      const [, created] = await Role.findOrCreate({ where: { name } });
      if (created) {
        console.log(`  ➕ Role: ${name}`);
        rolesAdded++;
      } else {
        rolesSkipped++;
      }
    }

    // ── Departments ───────────────────────────────────────────
    let deptsAdded = 0;
    let deptsSkipped = 0;

    for (const name of DEFAULT_DEPARTMENTS) {
      const [, created] = await Departments.findOrCreate({
        where: { dprtName: name },
      });
      if (created) {
        console.log(`  ➕ Department: ${name}`);
        deptsAdded++;
      } else {
        deptsSkipped++;
      }
    }

    console.log("\n── Summary ──────────────────────────────────");
    console.log(
      `Roles:       ${rolesAdded} added, ${rolesSkipped} already existed`,
    );
    console.log(
      `Departments: ${deptsAdded} added, ${deptsSkipped} already existed`,
    );
    console.log("─────────────────────────────────────────────");
    console.log("✅ Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
