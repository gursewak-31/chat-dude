import * as dbActions from "../database/app-db-actions.js";
import AppError from "../errors/app-errors.js";

export async function getConnections(userId: string){
    let connections = await dbActions.getConnections(userId);

    return connections;
}

export async function getUsers(userId: string){
    let users = await dbActions.getUsers(userId);

    return users;
}

export async function getConversation(conversationId: string, userId: string){
    let conversation = await dbActions.getConversation(conversationId, userId);

    return conversation;
}

export async function addNewConnection(userId: string, connectionId: string){
    let res = await dbActions.addNewConnection(userId, connectionId);

    if(!res) throw new AppError("Failed to add new connection.", 500);

    return res;
}