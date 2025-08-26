import { db } from "./db";
import { sql } from "drizzle-orm";

export async function getCompanionsDirect() {
  // Get companions with direct SQL to ensure gender field is included
  const result = await db.execute(sql`
    SELECT * FROM companions;
  `);
  
  return result.rows;
}