import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames =[
    "Programming",
    "Design",
    "Marketing",
    "Business",
    "Music",
    "Health & Fitness",
    "Personal Development",
    "Language Learning",
    "Science & Technology",
    "Finance",
    "Art & Creativity"
]

async function main(){
    console.log("Seeding categories...");

    try{
        const values = categoryNames.map(name => ({ name, description: `Videos related to ${name.toLowerCase()}`, }));
        await db.insert(categories).values(values);
        console.log("Categories seeded successfully.");
    }catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
      }
}

main();