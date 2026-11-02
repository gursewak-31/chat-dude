import router from "express";
import * as authController from "../controller/auth-controller.js";

const authRouter = router();

authRouter.post("/login", authController.login);

authRouter.post("/signup", authController.signup);

authRouter.get("/user", authController.getUser);

export default authRouter;