import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

export const mongoconnect = async () => {
    try {
       const conn =  await mongoose.connect(process.env.MONGO_URI);
       console.log(`MongoDB connected: ${conn.connection.host}`);
       
    } catch (error) {
        console.log('error while connecting to database', error.message || error);
        process.exit(1);
    }
}