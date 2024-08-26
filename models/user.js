import mongoose, { model, Schema } from "mongoose";
import { array } from "zod";



const UserSchema =new Schema ({
name:{
type:String,
required:true   },
username:{
    required:true,
    type:String,
    unique:true  },
password:{
    type:String,
    required:true,
    select:false  },
isOnline:{
    type:Boolean
},
pinned: [
    {
        type:String,
        ref:"Chat"
    }
],
avatar:{
    public_id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }}},
{timestamps:true}

);
//Used to hash password before saving 
//only done when password is modified 
UserSchema.pre("save" , async function(next){
    if ((!this.isModified("password"))) return next();
    //this.password = await bcrypt.hash(this.password,10);

})

export const User =   model("User" , UserSchema)