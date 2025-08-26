import { db } from "./db";
import { sql } from "drizzle-orm";

export async function getCompanionByIdDirect(id: number) {
  // Get companion with direct SQL to ensure gender field is included
  const result = await db.execute(sql`
    SELECT * FROM companions WHERE id = ${id};
  `);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}