import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("MongoDB Error:", error.message);

    // Retry after 5 sec instead of crashing
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;