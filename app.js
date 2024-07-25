import express, { urlencoded } from "express"
import mainRouter from "./Routes/mainRouter.js";
import { connectDB } from "./utils/feature.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { Server } from "socket.io"; 
import  { createServer } from "http"
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/event.js";
import { v4 as uuid } from "uuid";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import cors from "cors"
import {v2 as cloudinary} from "cloudinary"
import { SocketAuthenticator } from "./middlewares/Auth.js";


dotenv.config();
const app=express();
const server =  createServer(app)

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:4173'],
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

connectDB(process.env.MONGODB_URI)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
 
app.use(cors({
    origin: 'http://localhost:5173', // React app URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable the Access-Control-Allow-Credentials header
    optionsSuccessStatus: 204
  }))
// createGroupChats(10);//faker
//middleware used here
app.use(express.json())
app.use(cookieParser())


//all the current users connected to the circuitorserver 
const socketIds = new Map();
io.on("connection", (socket)=>{
   const user = socket.user;
//    console.log(user)
    socketIds.set(user._id,socket.id)
    console.log(`${socket.id} connected to server `)

    socket.on("disconnect",()=>{
        console.log("user disconnected")
        socketIds.delete(user._id)
    })
    socket.on(NEW_MESSAGE,async({chatId,message,members})=>{
        
        const messageForRealTime={
            content:message,
            _id:uuid(),
            sender:{
                _id:user._id,
                name:user.name
            },
            chatId,
            createdAt:new Date().toISOString()
        }
        console.log("new message",messageForRealTime)

        const messageForDb={
            content:message,
            sender:user._id,
            chatId
        }
        const UsersSocket=getSockets(members); //all the socket id of user we have to send messsage to
        io.to(UsersSocket).emit(NEW_MESSAGE,
            {messageForRealTime,chatId})
        io.to(UsersSocket).emit(NEW_MESSAGE_ALERT,{chatId  });
                 await Message.create(messageForDb)
    })

})

//main app routes start here
app.use("/api/v1/",mainRouter);
//SocketAuthentications
io.use((socket, next)=>{
    cookieParser()(socket.request , socket.request.resume, async(err)=>{
        await SocketAuthenticator(err , socket ,next)
        next();
    })

})
const PORT =3000;
server.listen(PORT, ()=>{
console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

export{socketIds};