import express, { urlencoded } from "express"
import mainRouter from "./Routes/mainRouter.js";
import { connectDB, pinChat } from "./utils/feature.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { Server } from "socket.io"; 
import  { createServer } from "http"
import { IS_TYPING, NEW_MESSAGE, NEW_MESSAGE_ALERT, STOP_TYPING, ONLINE_USER, USER_STATUS_CHANGE } from "./constants/event.js";
import { v4 as uuid } from "uuid";
import { getOnlineUsers, getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import cors from "cors"
import {v2 as cloudinary} from "cloudinary"
import { SocketAuthenticator } from "./middlewares/Auth.js";
import { User } from "./models/user.js";
import { Chat } from "./models/chat.js";




dotenv.config();

const app =express();
const server  = createServer(app)


const io = new Server(server,{
    cors:{
      origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.CLIENT_URL,
      ],
    
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}});

connectDB(process.env.MONGODB_URI)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
 
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.CLIENT_URL,
  ],

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204
  }))
// createGroupChats(10);//faker
//middleware used here
app.use(express.json())
app.use(cookieParser())


//all the current users connected to the circuitorserver 
const socketIds = new Map();
const onlineUsers = new Set(); 
//main app routes start here

app.use("/api/v1/",mainRouter);
//SocketAuthentications

app.set("io",io);

//!Unexpected behavior of sockeAuthenticator
io.use((socket, next)=>{
  cookieParser()(socket.request , socket.request.resume, async(err)=>{
       await SocketAuthenticator(err , socket ,next)
      
  })
 })


app.get("/",(req,res)=>[
    res.json( "hello!")
])



io.on("connection", async(socket)=>{
  const user = socket.user;
  socketIds.set(user._id.toString(), socket.id);
  if(user){
    const res  = await User.updateOne({_id:user._id},{
      $set:{isOnline:true}
    })
      const {onlineMemberIds} = await getOnlineUsers(user._id)
      io.to(socket.id).emit("myOnlineFriends",{onlineMemberIds})

     const onlineMemberSockets = getSockets(onlineMemberIds[0]?.onlineMembers)
     io.to(onlineMemberSockets).emit(USER_STATUS_CHANGE,{userId:user?.id,status:"online"})
     
  }

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };
    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      const results = await Promise.allSettled([
        Message.create(messageForDB),
        Chat.findByIdAndUpdate(chatId, { $set: { lastMessage: message } })
      ]);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
    
  });

  socket.on(IS_TYPING,(data)=>{
    const {members,chatId} = data;
    const userSockets = getSockets(members);
    socket.to(userSockets).emit(IS_TYPING,{chatId})
  })
  socket.on(STOP_TYPING,(data)=>{
    const {members,chatId} = data;
    const userSockets = getSockets(members);
    socket.to(userSockets).emit(STOP_TYPING,{chatId})
  })
  socket.on("pinchat",(data)=>{
    const {chatId ,pinned}= data; 
    console.log(chatId)
    pinChat({chatId,pinned,userSocket:socket?.id,userId:user?.id}) 
  })
  
  socket.on("disconnect",async()=>{
       console.log(`${socket.id} disconencted`)
       if(user){
        const res  = await User.updateOne({_id:user.id},{
          $set:{isOnline:false}
        })
        }
          const {onlineMemberIds} = await getOnlineUsers(user._id)
          const onlineMemberSockets = getSockets(onlineMemberIds[0]?.onlineMembers)
          io.to(onlineMemberSockets).emit(USER_STATUS_CHANGE,{userId:user?.id,status:"offline"})
          
          onlineUsers.delete(user._id.toString())
          socketIds.delete(user._id.toString())
       
  })

    
   
})
export {io}


const PORT =3000;
server.listen(PORT, ()=>{
console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

export{socketIds};