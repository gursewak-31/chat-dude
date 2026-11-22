import bcrypt from "bcrypt";
import connectDB from "../src/database/connection.js";

const demoPassword = "ChatDude123!";
const demoUsers = [
    { name: "Alex Morgan", email: "alex@example.com" },
    { name: "Jamie Lee", email: "jamie@example.com" },
    { name: "joy", email: "joy@example.com" }
];

const pool = await connectDB();

try {
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const userIds = new Map<string, number>();

    for (const user of demoUsers) {
        await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING`,
            [user.name, user.email, passwordHash],
        );

        const result = await pool.query<{ id: number }>(
            "SELECT id FROM users WHERE email = $1",
            [user.email],
        );
        const id = result.rows[0]?.id;
        if (id === undefined) {
            throw new Error(`Could not find seeded user ${user.email}`);
        }
        userIds.set(user.email, id);
    }

    const alexId = userIds.get("alex@example.com");
    const jamieId = userIds.get("jamie@example.com");
    if (alexId === undefined || jamieId === undefined) {
        throw new Error("Demo conversation users were not created");
    }

    // Reuse an existing conversation containing exactly Alex and Jamie.
    const existingConversation = await pool.query<{ id: number }>(
        `SELECT c.id
         FROM conversations c
         JOIN conversation_members cm ON cm.conversation_id = c.id
         GROUP BY c.id
         HAVING COUNT(*) = 2
            AND COUNT(*) FILTER (WHERE cm.user_id = ANY($1::int[])) = 2
         LIMIT 1`,
        [[alexId, jamieId]],
    );

    let conversationId = existingConversation.rows[0]?.id;
    if (conversationId === undefined) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const conversation = await client.query<{ id: number }>(
                "INSERT INTO conversations (created_by) VALUES ($1) RETURNING id",
                [alexId],
            );
            conversationId = conversation.rows[0]?.id;
            if (conversationId === undefined) {
                throw new Error("Could not create demo conversation");
            }
            await client.query(
                "INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)",
                [conversationId, alexId, jamieId],
            );
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    const messageCount = await pool.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM messages WHERE conversation_id = $1",
        [conversationId],
    );

    if (Number(messageCount.rows[0]?.count ?? 0) === 0) {
        await pool.query(
            `INSERT INTO messages (msg, sender_id, conversation_id)
             VALUES
                ($1, $2, $6),
                ($3, $4, $6),
                ($5, $2, $6)`,
            [
                "Hey Jamie! Welcome to Chat-Dude.", alexId,
                "Thanks, Alex! This is a great place to start.", jamieId,
                "Glad you think so. Let's catch up soon!", conversationId
            ],
        );
    }

    console.log("Seed complete.");
    console.log(`Demo login: alex@example.com / ${demoPassword}`);
    console.log(`Demo login: jamie@example.com / ${demoPassword}`);
    console.log(`Demo login: joy@example.com / ${demoPassword}`);
} finally {
    await pool.end();
}
