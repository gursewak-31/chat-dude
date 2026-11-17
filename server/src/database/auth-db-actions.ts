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

export async function insertRefreshToken(userId: string, refreshToken: string){
    let conn = await connectDB();

    let insert = await conn.query(
        "INSERT INTO refresh_tokens (user_id, token, created_at, expire_at) VALUES ($1, $2, NOW(), NOW() + INTERVAL '1 day') RETURNING id",
        [userId, refreshToken]
    );

    return insert.rows[0].id; // return the id of the inserted refresh token
}

export async function getRefreshToken(userId: string, refreshToken: string){
    let conn = await connectDB();

    let select = await conn.query(
        "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2 AND expire_at > NOW() AND revoked_at IS NULL",
        [userId, refreshToken]
    );

    return select.rows[0]; // return the refresh token object
}

export async function revokeRefreshToken(userId: string, refreshToken: string){
    let conn = await connectDB();

    let update = await conn.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token = $2",
        [userId, refreshToken]
    );

    return update.rowCount && update.rowCount > 0; // return true if a row was updated, false otherwise
}
