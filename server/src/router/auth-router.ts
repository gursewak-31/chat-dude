import router from "express";
import * as authController from "../controller/auth-controller.js";
import limiter from "../middleware/limiter-middleware.js";

const authRouter = router();

authRouter.post("/login", limiter, authController.login);

authRouter.post("/signup", authController.signup);

authRouter.get("/user", authController.getUser);

authRouter.get("/logout", authController.logout);

authRouter.get("/refresh", authController.refresh);

export default authRouter;