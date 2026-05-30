import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const clearCache = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await mongoose.connection.db.collection('dailyrecommendations').deleteMany({});
        console.log(`Cleared ${result.deletedCount} recommendations`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

clearCache();
