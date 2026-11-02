import type { Request, Response, NextFunction} from "express";
import * as appService from "../service/app-service.js";

export async function getConnections(req: Request, res: Response, next: NextFunction){
    try{
        let data = await appService.getConnections(req.userId);
        res.status(200).json({success: true, data: data});
    }catch(error){
        next(error);
    }
}

export async function getUsers(req: Request, res: Response, next: NextFunction){
    try{
        let data = await appService.getUsers(req.userId);
        res.status(200).json({success: true, data: data});
    }catch(error){
        next(error);
    }
}

export async function getConversation(req: Request, res: Response, next: NextFunction){
    try{
        let conversationId = req.params.conversationId ?? '';
        let data = await appService.getConversation(conversationId as string, req.userId);
        res.status(200).json({success: true, data: data});
    }catch(error){
        next(error);
    }
}

export async function addNewConnection(req: Request, res: Response, next: NextFunction){
    try{
        await appService.addNewConnection(req.userId, req.body.connectionId);

        res.status(200).json({success: true, msg: "new connection added."});
    }catch(error){
        next(error);
    }
}