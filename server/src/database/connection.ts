import { Pool } from "pg";
import AppError from "../errors/app-errors.js";
import dotenv from "dotenv";

dotenv.config();

const database_url = process.env.DB_URL;

export default async function connectDB(){
    try{
        const pool = new Pool({
            connectionString: database_url
        });

        return pool;
    }catch(err){
        throw new AppError("Database connection failed.", 500);
    }
}