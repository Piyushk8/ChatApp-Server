import express from "express"
 import UserRouter from "./user.js";
 import ChatRouter from "./chat.js";
const mainRouter = express.Router();


mainRouter.use("/user",UserRouter);
mainRouter.use("/chat",ChatRouter)



export default mainRouter;