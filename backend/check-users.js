import mongoose from "mongoose";
import User from "./models/User.js";
import "./config/env.js";

async function checkUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}, "email password");
  console.log("Users in DB:", users);
  mongoose.disconnect();
}

checkUsers();
