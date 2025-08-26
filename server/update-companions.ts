import { db } from "./db";
import { companions } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateCompanions() {
  console.log("Updating companion gender information...");

  // Map of companion names to their genders
  const genderMap = {
    "Sophia": "female",
    "Alex": "male",
    "Emma": "female",
    "Ava": "female",
    "James": "male",
    "Lily": "female"
  };

  for (const [name, gender] of Object.entries(genderMap)) {
    // Update each companion by name
    const result = await db.update(companions)
      .set({ gender })
      .where(eq(companions.name, name));
    
    console.log(`Updated gender for ${name} to ${gender}`);
  }

  console.log("Companion gender information updated successfully!");
}

// Execute the update function
updateCompanions().catch(console.error);