import type { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { addMessage, getConversationMembers, isConversationMember } from "../database/app-db-actions.js";
import type { ClientMessage } from "../types/app-types.js";

dotenv.config();

const connectedUsers = new Map<string, WebSocket>();

export default function setupWebSocket(server: Server) {
    const wss = new WebSocketServer({ noServer: true });

    // Attach upgrades to this WebSocket server; authentication happens in the first frame.
    server.on("upgrade", (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (webSocket) => {
            wss.emit("connection", webSocket, request);
        });
    });

    wss.on("connection", (webSocket) => {
        let userId: string | undefined;
        let tokenExpiryTimer: ReturnType<typeof setTimeout> | undefined;

        webSocket.on("message", async (rawMessage) => {
            let message: ClientMessage;
            try {
                message = JSON.parse(rawMessage.toString()) as ClientMessage;
            } catch {
                webSocket.close(1003, "Invalid JSON message");
                return;
            }

            if (message.type === "AUTH") {
                let accessToken = message.accessToken;
                let secret = process.env.JWT_ACCESS_SECRET;

                // Do not register a socket unless a verifiable access token is supplied.
                if (typeof accessToken !== "string" || !secret) {
                    webSocket.close(1008, "Access token required");
                    return;
                }

                // Reject repeated authentication.
                if (userId) {
                    webSocket.close(1008, "Already authenticated");
                    return;
                }

                try {
                    let decoded = jwt.verify(accessToken, secret);
                    // The verified token must contain the user identifier used by chat storage.
                    if (typeof decoded === "string" || (typeof decoded.id !== "string" && typeof decoded.id !== "number")) {
                        webSocket.close(1008, "Invalid access token");
                        return;
                    }

                    userId = String(decoded.id);

                    let previousSocket = connectedUsers.get(userId);
                    if (previousSocket && previousSocket !== webSocket) {
                        previousSocket.close(4002, "Connection replaced");
                    }

                    connectedUsers.set(userId, webSocket);
                    // End the connection when its access token expires; a refreshed token can reconnect.
                    if (tokenExpiryTimer) clearTimeout(tokenExpiryTimer);
                    if (typeof decoded.exp === "number") {
                        tokenExpiryTimer = setTimeout(() => {
                            webSocket.close(4001, "Access token expired");
                        }, Math.max(0, decoded.exp * 1000 - Date.now()));
                    }

                    webSocket.send(JSON.stringify({ type: "AUTH_STATUS", status: "authenticated" }));
                } catch {
                    webSocket.close(4001, "Invalid or expired access token");
                }
                return;
            }

            // Reject every non-auth message until this socket is the registered connection for its user.
            if (!userId || connectedUsers.get(userId) !== webSocket) {
                webSocket.close(1008, "Authenticate before sending messages");
                return;
            }

            if (message.type !== "MESSAGE") return;

            let conversationId = message.sendTo;
            let text = message.text;
            if ((typeof conversationId !== "string" && typeof conversationId !== "number") || typeof text !== "string" || !text.trim()) {
                webSocket.send(JSON.stringify({ type: "MESSAGE_STATUS", status: "error", error: "Invalid message" }));
                return;
            }

            try {
                // Prevent authenticated users from writing to conversations they do not belong to.
                if (!(await isConversationMember(String(conversationId), userId))) {
                    webSocket.send(JSON.stringify({ type: "MESSAGE_STATUS", status: "error", error: "Conversation not found" }));
                    return;
                }

                let newMessage = await addMessage({
                    message: text,
                    senderId: Number(userId),
                    conversationId: Number(conversationId),
                });
                let recipients = await getConversationMembers(String(conversationId), userId);

                // Deliver to online conversation members, then acknowledge the persisted message to its sender.
                for (let recipient of recipients) {
                    let recipientSocket = connectedUsers.get(String(recipient.user_id));
                    if (recipientSocket?.readyState === WebSocket.OPEN) {
                        recipientSocket.send(JSON.stringify({ type: "NEW_MESSAGE", msgInfo: newMessage }));
                    }
                }

                if (webSocket.readyState === WebSocket.OPEN) {
                    webSocket.send(JSON.stringify({ type: "MESSAGE_STATUS", status: "sent", msgInfo: newMessage }));
                }
            } catch (error) {
                console.error("WebSocket message handling failed:", error);
                if (webSocket.readyState === WebSocket.OPEN) {
                    webSocket.send(JSON.stringify({ type: "MESSAGE_STATUS", status: "error", error: "Unable to send message" }));
                }
            }
        });

        webSocket.on("close", () => {
            if (tokenExpiryTimer) clearTimeout(tokenExpiryTimer);
            // A replaced socket must not remove the newer socket from the user map.
            if (userId && connectedUsers.get(userId) === webSocket) {
                connectedUsers.delete(userId);
            }
        });

        webSocket.on("error", (error) => {
            console.error("WebSocket connection error:", error);
        });
    });
}
