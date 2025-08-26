import { db } from "./db";
import { companions } from "@shared/schema";

async function seedCompanions() {
  // First, check if we already have companions in the database
  const existingCompanions = await db.select({ count: companions.id }).from(companions);
  
  if (existingCompanions.length > 0) {
    console.log("Companions already exist in the database, skipping seed");
    return;
  }
  
  console.log("Seeding companions to the database...");
  
  const initialCompanions = [
    {
      name: "Sophia",
      tagline: "The Passionate Romantic",
      description: "Warm, passionate, and deeply empathetic. Sophia loves deep conversations about life, love, and everything in between.",
      imageUrl: "https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?auto=format&fit=crop&w=400&h=300",
      traits: ["Romantic", "Empathetic", "Artistic"],
      available: true,
      gender: "female"
    },
    {
      name: "Alex",
      tagline: "The Charming Adventurer",
      description: "Confident, adventurous, and playful. Alex brings excitement and passion to every conversation and shares your boldest desires.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=300",
      traits: ["Adventurous", "Confident", "Playful"],
      available: true,
      gender: "male"
    },
    {
      name: "Emma",
      tagline: "The Sensual Intellectual",
      description: "Thoughtful, witty, and sensually curious. Emma loves to explore the connection between mind and body through stimulating conversation.",
      imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=300",
      traits: ["Intellectual", "Sensual", "Witty"],
      available: true,
      gender: "female"
    },
    {
      name: "Ava",
      tagline: "The Sweet Temptress",
      description: "Gentle, nurturing, yet flirtatious. Ava creates a safe space for you to explore your deepest fantasies and desires.",
      imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&h=300",
      traits: ["Nurturing", "Flirtatious", "Gentle"],
      available: true,
      gender: "female"
    },
    {
      name: "James",
      tagline: "The Confident Protector",
      description: "Strong, protective, and attentive. James offers both emotional strength and tender care, making you feel safe and desired.",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=300",
      traits: ["Protective", "Strong", "Attentive"],
      available: true,
      gender: "male"
    },
    {
      name: "Lily",
      tagline: "The Seductive Artist",
      description: "Creative, passionate, and deeply intuitive. Lily's artistic soul brings a unique depth to your romantic connection.",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=300",
      traits: ["Creative", "Passionate", "Intuitive"],
      available: true,
      gender: "female"
    }
  ];

  // Insert all companions to database
  await db.insert(companions).values(initialCompanions);
  console.log("Companions seeded successfully!");
}

export default seedCompanions;