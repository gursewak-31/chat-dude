import { Pool } from "pg";
import AppError from "../errors/app-errors.js";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.DB_HOST;
const port = parseInt(process.env.DB_PORT as string);
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

export default async function connectDB(){
    try{
        const pool = new Pool({
            host: host,
            port: port,
            user: user,
            password: password,
            database: database
        });

        return pool;
    }catch(err){
        throw new AppError("Database connection failed.", 500);
    }
}