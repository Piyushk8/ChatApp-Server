import express, { urlencoded } from "express"
import UserRouter from "./Routes/user.js";
import mainRouter from "./Routes/mainRouter.js";
import { ConnectDB } from "./utils/feature.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { createUser } from "./seeders/user.js";
dotenv.config();
const app  =express();

ConnectDB(process.env.MONGODB_URL)

//middleware used here
app.use(express.json())
app.use(cookieParser())
// app.use(urlencoded())


//main app routes start here
app.use("/api/v1/",mainRouter);

app.listen(3000, ()=>{

})