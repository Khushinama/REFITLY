import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OutfitHistory from '../models/OutfitHistory.js';
import Outfit from '../models/Outfit.js';
import { addOutfitHistory } from '../controllers/historyController.js';

dotenv.config({ path: './.env' });

async function runTest() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const userId = "69f89f4d14a92abf4f752f79";

        // Find or create a mock Outfit to reference
        let outfit = await Outfit.findOne({ userId });
        if (!outfit) {
            console.log("Creating a mock outfit...");
            outfit = await Outfit.create({
                userId,
                signature: "mock-signature-12345",
                score: 92,
                items: {
                    top: { name: "Silk Blazer", category: "top", styleTags: ["Classy"], vibe: "classy", color: "Black" },
                    bottom: { name: "Pleated Skirt", category: "bottom", styleTags: ["Elegant"], vibe: "classy", color: "Black" },
                    shoes: { name: "Leather Heels", category: "footwear", styleTags: ["Heels"], vibe: "classy", color: "Black" }
                },
                colorPalette: ["Black"]
            });
        }

        const today = new Date();
        const wornDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

        // --- TEST 1: Saving history WITH explicit reasons ---
        console.log("\n--- TEST 1: Saving history WITH explicit reasons ---");
        await OutfitHistory.deleteMany({ user: userId, outfitId: outfit._id, wornDate });

        const payload1 = {
            outfitId: outfit.signature,
            outfit: outfit,
            event: "Date Night",
            style: "Classy",
            mood: "Elegant Date Night",
            season: "Summer",
            reasons: ["Test reason 1", "Test reason 2"]
        };

        let resultData = null;
        let res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(response) {
                if (response.success) {
                    resultData = response.data;
                    console.log("SUCCESS: Marked worn with explicit reasons.");
                } else {
                    console.error("ERROR: ", response.message);
                }
            }
        };

        await addOutfitHistory({ user: { _id: userId }, body: payload1 }, res);

        if (resultData) {
            const doc = await OutfitHistory.findById(resultData._id);
            console.log("Saved Reasons in DB:", doc.reasons);
            if (doc.reasons && doc.reasons.length === 2 && doc.reasons[0] === "Test reason 1") {
                console.log("✅ TEST 1 PASSED: Explicit reasons successfully saved.");
            } else {
                console.error("❌ TEST 1 FAILED: Reasons not saved properly.");
            }
        }

        // --- TEST 2: Saving history WITHOUT reasons (Auto-generate Fallback) ---
        console.log("\n--- TEST 2: Saving history WITHOUT reasons (Fallback generation) ---");
        await OutfitHistory.deleteMany({ user: userId, outfitId: outfit._id, wornDate });

        const payload2 = {
            outfitId: outfit.signature,
            outfit: outfit,
            event: "Date Night",
            style: "Classy",
            mood: "Elegant Date Night",
            season: "Summer"
            // reasons omitted
        };

        resultData = null;
        res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(response) {
                if (response.success) {
                    resultData = response.data;
                    console.log("SUCCESS: Marked worn without reasons.");
                } else {
                    console.error("ERROR: ", response.message);
                }
            }
        };

        await addOutfitHistory({ user: { _id: userId }, body: payload2 }, res);

        if (resultData) {
            const doc = await OutfitHistory.findById(resultData._id);
            console.log("Auto-generated Reasons in DB:", doc.reasons);
            if (doc.reasons && doc.reasons.length > 0) {
                console.log("✅ TEST 2 PASSED: Auto-generated reasons successfully generated and saved.");
            } else {
                console.error("❌ TEST 2 FAILED: Fallback reasons are empty.");
            }
        }

        await mongoose.disconnect();
        console.log("\nDisconnected from database.");
    } catch (err) {
        console.error("Test error:", err);
    }
}

runTest();
