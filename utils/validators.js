
import {body, check, validationResult} from "express-validator"
import { TryCatch } from "../middlewares/error.js";
import  ErrorHandler  from "../utils/utility.js";
//returns array of all important fields
const registerValidator = ()=>[
    body("name","Please enterName").notEmpty(),
    body("username","Please Enter UserName").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
    
    ] 

const LoginValidator = ()=>[
    body("username","Please Enter UserName").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
] 




//main validator for transmitting error msg to error middleware
const validateHandler = TryCatch((req,res,next)=>{
    const errors = validationResult(req);
    const Errormsg = errors.array().map((error)=>error.msg).join(",")
    if(errors.isEmpty()) return next();
    else return next(new ErrorHandler(Errormsg,400))
})
export {registerValidator , validateHandler,LoginValidator}