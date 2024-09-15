import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function connect(): Promise<typeof mongoose> {
  try {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(process.env.MONGODB_URL_D as string);
    console.log("Database connected");
    return db;
  } catch (error) {
    console.error("Database connection failed", error);
    throw error;
  }
}

export default connect;
