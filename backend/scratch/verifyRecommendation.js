import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Outfit from '../models/Outfit.js';
import { generateOutfits } from '../services/recommendationEngine.js';

dotenv.config({ path: './.env' });

async function test() {
    try {
        console.log("Connecting to database at:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database connected successfully.");

        // Real user ID from DB
        const userId = "69f89f4d14a92abf4f752f79";

        // Import Wardrobe dynamically inside or just fetch it
        const Wardrobe = mongoose.model('Wardrobe');
        const items = await Wardrobe.find({ user: userId });
        console.log(`User has ${items.length} wardrobe items:`);
        items.forEach(i => console.log(`- [${i.category}] ${i.name} | Color: ${i.color} | StyleTags: ${i.styleTags} | Season: ${i.season} | Event: ${i.event}`));

        console.log("\n========================================================");
        console.log("TEST 1: Casual Summer Recommendations for Sara Minimal");
        console.log("========================================================");
        const result1 = await generateOutfits(userId, {
            event: ["casual"],
            style: ["minimal"],
            season: "summer",
            limit: 5
        });

        if (result1.error) {
            console.error("❌ Test 1 failed:", result1.message);
        } else {
            console.log(`Generated ${result1.data.outfits.length} outfits.`);
            result1.data.outfits.forEach((outfit, index) => {
                console.log(`\nOutfit #${index + 1}: Score: ${outfit.score}%`);
                console.log("Breakdown:", JSON.stringify(outfit.matchBreakdown));
                console.log("Items:", Object.entries(outfit.items).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v.name} (${v.color}, ${v.season})`).join(" | "));
                console.log("Why reasons:", outfit.whyReasons);
            });
        }

        console.log("\n========================================================");
        console.log("TEST 2: Formal Winter Recommendations");
        console.log("========================================================");
        const result2 = await generateOutfits(userId, {
            event: ["formal"],
            style: ["classy"],
            season: "winter",
            limit: 5
        });

        if (result2.error) {
            console.error("❌ Test 2 failed:", result2.message);
        } else {
            console.log(`Generated ${result2.data.outfits.length} outfits.`);
            result2.data.outfits.forEach((outfit, index) => {
                console.log(`\nOutfit #${index + 1}: Score: ${outfit.score}%`);
                console.log("Breakdown:", JSON.stringify(outfit.matchBreakdown));
                console.log("Items:", Object.entries(outfit.items).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v.name} (${v.color}, ${v.season})`).join(" | "));
                console.log("Why reasons:", outfit.whyReasons);
            });
        }

        console.log("\n========================================================");
        console.log("TEST 3: Date Night Classy Summer Recommendations");
        console.log("========================================================");
        const result3 = await generateOutfits(userId, {
            event: ["party", "casual"], // Date night corresponds to party + casual in FILTER_MAP
            style: ["classy"],
            season: "summer",
            limit: 5
        });

        if (result3.error) {
            console.error("❌ Test 3 failed:", result3.message);
        } else {
            console.log(`Generated ${result3.data.outfits.length} outfits.`);
            result3.data.outfits.forEach((outfit, index) => {
                console.log(`\nOutfit #${index + 1}: Score: ${outfit.score}%`);
                console.log("Breakdown:", JSON.stringify(outfit.matchBreakdown));
                console.log("Items:", Object.entries(outfit.items).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v.name} (${v.color}, ${v.season})`).join(" | "));
                console.log("Why reasons:", outfit.whyReasons);
            });
        }

        await mongoose.disconnect();
        console.log("\nDisconnected from database.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed with error:", err);
        process.exit(1);
    }
}

test();
