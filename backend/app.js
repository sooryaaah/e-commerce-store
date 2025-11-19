import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js"
import { mongoconnect } from "./db/connect.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
  

app.use("/api/auth", authRoutes)


app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
    
    mongoconnect()
}) 