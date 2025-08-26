import { db } from "./db";
import { companions } from "@shared/schema";
import { sql } from "drizzle-orm";

async function fixCompanionGendersDirect() {
  console.log("Fixing companion gender information using direct SQL...");

  // Use direct SQL to check current values
  const currentValues = await db.execute(sql`
    SELECT id, name, gender FROM companions;
  `);
  console.log("Current gender values:", currentValues.rows);
  
  // Use direct SQL to update genders
  console.log("Setting Alex (id 2) to male...");
  await db.execute(sql`
    UPDATE companions SET gender = 'male' WHERE id = 2;
  `);
  
  console.log("Setting James (id 5) to male...");
  await db.execute(sql`
    UPDATE companions SET gender = 'male' WHERE id = 5;
  `);
  
  console.log("Setting all female companions...");
  await db.execute(sql`
    UPDATE companions SET gender = 'female' WHERE id IN (1, 3, 4, 6);
  `);
  
  // Verify with direct SQL
  const updatedValues = await db.execute(sql`
    SELECT id, name, gender FROM companions;
  `);
  console.log("Updated gender values:", updatedValues.rows);
  
  console.log("Gender values updated using direct SQL!");
}

// Execute the function
fixCompanionGendersDirect().catch(console.error);