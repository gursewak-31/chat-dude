import type { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { parseCookie } from "cookie";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { addMessage, getConversationMembers } from "../database/app-db-actions.js";

dotenv.config();

let webSocketUsers = new Map();
let conntectedUsers = new Map();

export default function setupWebSocket(server: Server){
    const wss = new WebSocketServer({
        noServer: true
    });

    server.on("upgrade", (req, socket, head) => {
        try{
            let cookie = parseCookie(req.headers.cookie ?? "");
            let token = cookie.token;

            if(!token || !process.env.JWT_SECRET){
                return;
            }

            let decode = jwt.verify(token, process.env.JWT_SECRET) as {id: string};
            let userId = decode.id;

            wss.handleUpgrade(req, socket, head, (ws) => {
                webSocketUsers.set(ws, userId);
                wss.emit("connection", ws, req);
            });
        }catch(error){
            return;
        }

    });

    wss.on("connection", (socket) => {
        let userId = webSocketUsers.get(socket);
        conntectedUsers.set(userId, socket);
        // console.log("conntect to websocket: ", userId);

        socket.on("message", async (info) => {
            let infoData = JSON.parse(info.toString());
            let conversationId = infoData.sendTo;
            let newMsgDetail = await addMessage({message: infoData.text, senderId: userId, conversationId: conversationId});
            let recivers = await getConversationMembers(conversationId, userId);

            recivers.forEach((reciver) => {
                let reciverSocket = conntectedUsers.get(reciver.user_id);

                if(reciverSocket && reciverSocket.readyState === WebSocket.OPEN){
                    // let newMsgDetail = await addMessage({message: infoData.text, senderId: userId, conversationId: infoData.sendTo});
                    if(newMsgDetail){
                        // send message to reciver
                        reciverSocket.send(JSON.stringify({
                            type: "new_message",
                            msgInfo: newMsgDetail
                        }));

                        // send message to sender
                        socket.send(JSON.stringify({
                            type: "message_status",
                            status: "sent",
                            msgInfo: newMsgDetail
                        }));
                    }
                }
            })

            // socket.send("message recieve: " + msg);
        });

    })
}