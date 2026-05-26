import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: './backend/.env' });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await User.updateMany(
      { email: { $in: ["sara@test.com", "alex@test.com", "maya@test.com"] } },
      { 
        $set: { 
          isVerified: true, 
          verificationToken: null 
        } 
      }
    );
    console.log(`✅ Force verified ${res.modifiedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
