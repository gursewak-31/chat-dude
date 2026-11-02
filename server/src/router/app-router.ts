import { Router } from "express";
import * as appController from "../controller/app-controller.js";

const appRouter = Router();

appRouter.get("/connections", appController.getConnections);

appRouter.get("/conversation/:conversationId", appController.getConversation);

appRouter.get("/users", appController.getUsers);

appRouter.post("/new-connection", appController.addNewConnection);

export default appRouter;