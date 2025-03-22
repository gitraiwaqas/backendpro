import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const ConnectToDb = async () => {
  try {
    const connect = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected successfully! Host: ${connect.connection.host}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default ConnectToDb;
