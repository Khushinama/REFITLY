import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OutfitHistory from '../models/OutfitHistory.js';
import Outfit from '../models/Outfit.js';
import { addOutfitHistory } from '../controllers/historyController.js';

dotenv.config({ path: './.env' });

async function test() {
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

        // Test metadata values
        const payload = {
            outfitId: outfit.signature,
            outfit: outfit,
            event: "Date Night",
            style: "Classy",
            mood: "Elegant Date Night",
            season: "Summer"
        };

        const req = {
            user: { _id: userId },
            body: payload
        };

        let resultData = null;
        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(response) {
                console.log(`Response Status: ${this.statusCode || 200}`);
                if (response.success) {
                    resultData = response.data;
                    console.log("Successfully marked worn!");
                    console.log("Returned entry details:", {
                        event: response.data.event,
                        style: response.data.style,
                        mood: response.data.mood,
                        season: response.data.season,
                        notes: response.data.notes
                    });
                } else {
                    console.log("Error returned:", response.message);
                }
            }
        };

        // Clean up today's entries first to avoid unique key duplicates
        const today = new Date();
        const wornDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        await OutfitHistory.deleteMany({ user: userId, outfitId: outfit._id, wornDate });

        console.log("Executing addOutfitHistory flow...");
        await addOutfitHistory(req, res);

        // Fetch from DB to confirm persistence
        if (resultData) {
            console.log("\nQuerying MongoDB directly for verification...");
            const doc = await OutfitHistory.findById(resultData._id);
            console.log("Saved Mongoose Document:");
            console.log({
                _id: doc._id,
                wornDate: doc.wornDate,
                event: doc.event,
                style: doc.style,
                mood: doc.mood,
                season: doc.season,
                notes: doc.notes
            });
            
            if (doc.notes && doc.style === "Classy" && doc.mood === "Elegant Date Night") {
                console.log("✅ SUCCESS: Enriched metadata and dynamic AI styling notes verified successfully.");
            } else {
                console.error("❌ FAILED: Saved fields do not match expected outcomes.");
            }
        }

        await mongoose.disconnect();
        console.log("Disconnected.");
    } catch (err) {
        console.error("Test error:", err);
    }
}

test();
