import type { ConnectionUser } from "../types/app-types.js";
import connectDB from "./connection.js";

export async function getConnections(userId: string){
    let conn = await connectDB();

    // select all users who match conversation id as userId
    // let select = await conn.query<ConnectionUser>(
    //     `SELECT u.id, u.name 
    //     FROM users u 
    //     JOIN conversation_members cm 
    //         ON u.id = cm.user_id 
    //     WHERE cm.conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = $1)`,
    //     [userId]
    // );

    let select = await conn.query(
        `SELECT 
            u.name, c.id
        FROM users u 
        JOIN conversation_members cm 
            ON u.id = cm.user_id
        JOIN conversations c
            ON c.id = cm.conversation_id
        WHERE c.id IN (
            SELECT conversation_id FROM conversation_members WHERE user_id = $1
        ) 
            AND u.id <> $2`,
        [userId, userId]
    )

    return select.rows;
}

export async function getUsers(userId: string){
    let conn = await connectDB();

    // select all users who are not in conversation with userId or other one and not the user itself
    let select = await conn.query(
        `SELECT u.id, u.name 
        FROM users u 
        LEFT JOIN conversation_members cm 
            ON u.id = cm.user_id 
        WHERE u.id <> $1 
            AND NOT EXISTS (
                SELECT 1 
                FROM conversation_members cm1 
                JOIN conversation_members cm2 
                    ON cm1.conversation_id = cm2.conversation_id
                WHERE cm1.user_id = u.id
                    AND cm2.user_id = $2
            )`,
        [userId, userId]
    );

    return select.rows;
}

export async function addMessage(data: {message: string, senderId: number, conversationId: number}){
    let conn = await connectDB();

    let insert = await conn.query(
        "INSERT INTO messages (msg, sender_id, conversation_id) VALUES ($1, $2, $3) RETURNING id", 
        [data.message, data.senderId, data.conversationId]);

    let newMessageId = insert.rows[0].id;

    let select = await conn.query(
        "SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = $1",
        [newMessageId]
    )

    return select.rows[0]; // return new inserted object
}

export async function getConversation(conversationId: string, userId: string){
    let conn = await connectDB();

    let select = await conn.query(
        `SELECT 
            m.*, u.name as sender_name
        FROM messages m
        JOIN users u 
            ON u.id = m.sender_id
        WHERE conversation_id = $1
        ORDER BY m.created_at ASC`,
        [conversationId]
    );

    return select.rows;

    // get messsages where sender is connection and reciver is user or sender is user and reciver is connection
    // let select = await conn.query(
    //     "SELECT * FROM messages WHERE (sender_id = $1 AND userId = $2) OR (userId = $3 AND senderId = $4)",
    //     [connectionId, userId, connectionId, userId]);

    return [];
}

export async function getConversationMembers(conversationId: string, userId: string){
    let conn = await connectDB();

    let select = await conn.query(
        "SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND user_id <> $2",
        [conversationId, userId]
    );

    return select.rows;
}

export async function addNewConnection(userId: string, newConnectionId: string){
    let conn = await connectDB();

    await conn.query("BEGIN");
    try{
        let insert1 = await conn.query(
            "INSERT INTO conversations (created_by) VALUES ($1) RETURNING id",
            [userId]
        );

        let newConversationId = insert1.rows[0].id;

        let insert2 = await conn.query(
            "INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($3, $4)",
            [newConversationId, userId, newConversationId, newConnectionId]
        );

        await conn.query("COMMIT");

        return true;
    }catch(error){
        await conn.query("ROLLBACK");
        throw error;
    }
}