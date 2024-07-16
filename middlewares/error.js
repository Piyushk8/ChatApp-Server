const errorMiddleware = (err,req,res,next)=>{
err.message ||= "internal Server Error";
err.statusCode ||= 500;

res.status(err.statusCode).json({success:false,message:err.message})
}


const TryCatch=(passedfunction)=> async(req,res,next)=>{
try{
    
   await passedfunction(req,res,next)
}
catch(error){
    next(error);
}};






export {errorMiddleware ,TryCatch}