import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OutfitHistory from '../models/OutfitHistory.js';
import Outfit from '../models/Outfit.js';
import { getOutfitHistoryCalendar } from '../controllers/historyController.js';

dotenv.config({ path: './.env' });

async function test() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Real user ID from DB
        const userId = "69f89f4d14a92abf4f752f79";

        // Mock req and res
        const req = {
            user: { _id: userId },
            query: { month: "5", year: "2026" } // May 2026
        };

        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                console.log(`Response (Status: ${this.statusCode || 200}):`);
                console.log(JSON.stringify(data, null, 2));
            }
        };

        console.log("Calling getOutfitHistoryCalendar for May 2026...");
        await getOutfitHistoryCalendar(req, res);

        await mongoose.disconnect();
        console.log("Disconnected.");
    } catch (err) {
        console.error("Test error:", err);
    }
}

test();
