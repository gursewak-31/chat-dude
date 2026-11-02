import connectDB from "./connection.js";
import type { SignupUser, StoredUser } from "../types/auth-types.js";

export async function insertUser(data: SignupUser){
    let conn = await connectDB();

    let insert = await conn.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id", 
        [data.name, data.email, data.password]);

    return insert.rows[0].id; // return the id of the inserted user  
}

export async function getUserByEmail(email: string){
    let conn = await connectDB();

    let select = await conn.query(
        "SELECT * FROM users WHERE email = $1", 
        [email]);

    return select.rows[0]; // return the user object
}

export async function getUserById(id: string){
    let conn = await connectDB();

    let select = await conn.query<StoredUser>(
        "SELECT id, name, email, created_at FROM users WHERE id = $1", 
        [id]);

    return select.rows[0]; // return the user object
}
