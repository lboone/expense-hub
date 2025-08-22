import mongoose from "mongoose";
import Env from "./env.config";

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(Env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log(
      `Connected successfully to MongoDB database: ${conn.connection.name}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB database", error);
    process.exit(1);
  }
};

export default connectDatabase;
