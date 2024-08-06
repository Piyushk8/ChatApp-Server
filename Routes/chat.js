import express from "express"
import { AuthMiddleware } from "../middlewares/Auth.js";
import { newGroupChat ,getMyChat,leaveGroup, getMyGroup,addMembers, RemoveMember, SendAttachment, getChatDetails, RenameGroup, deleteChat, getMessages } from "../controllers/chat.js";
import { errorMiddleware } from "../middlewares/error.js";
import { attachmentsMulter } from "../middlewares/multer.js";
const ChatRouter = express.Router();
ChatRouter.use(AuthMiddleware);

ChatRouter.post("/new" ,newGroupChat )
ChatRouter.get("/my",getMyChat)
ChatRouter.get("/my/groups",getMyGroup)
ChatRouter.put("/addmembers",addMembers)
ChatRouter.put("/removemember",RemoveMember)
ChatRouter.delete("/leave/:id",leaveGroup)
ChatRouter.post("/message",attachmentsMulter, SendAttachment )
ChatRouter.get("/message/:id",getMessages)
//below routes should be below all routes 
//might be confused by "/anyroute"
ChatRouter.get("/:id" ,getChatDetails)
ChatRouter.put("/:id" ,RenameGroup)
ChatRouter.delete("/:id",deleteChat)

ChatRouter.use(errorMiddleware)


//send attachments
//get messages
//get chat details

export default ChatRouter