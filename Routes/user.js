import express from "express"
import { getMyProfile, login , newUser , Logout ,SearchUser, SendRequest, acceptRequest, getNotifications, getMyFriends} from "../controllers/user.js";
import {  singleAvatar } from "../middlewares/multer.js";
import { errorMiddleware} from "../middlewares/error.js";
import { AuthMiddleware } from "../middlewares/Auth.js";
import { LoginValidator, registerValidator, validateHandler } from "../utils/validators.js";

const UserRouter = express.Router();
 
UserRouter.post("/login" ,LoginValidator(),validateHandler, login)
UserRouter.post("/signup",singleAvatar,registerValidator(),validateHandler,newUser)


//these routes require authentications
UserRouter.get("/me" ,AuthMiddleware, getMyProfile)
UserRouter.get("/logout",Logout)
UserRouter.put("/sendRequest",AuthMiddleware,SendRequest,errorMiddleware)
UserRouter.delete("/acceptRequest",AuthMiddleware,acceptRequest)
UserRouter.get("/search",AuthMiddleware,SearchUser)
UserRouter.get("/notifications",AuthMiddleware,getNotifications)
UserRouter.get("/friends",AuthMiddleware,getMyFriends)
UserRouter.use(errorMiddleware);
export default UserRouter;
