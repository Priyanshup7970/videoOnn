import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { error } from "console";


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connect.host}`);
    }
    catch(error){
        console.log("MONGODB connection error",error);
        process.exit(1)
    }
}

export default connectDB

.then(() =>{
    app/listenerCount(process.env.PORT || 8000,()=>{
        console.log(` server is running at port:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!!",err)
})