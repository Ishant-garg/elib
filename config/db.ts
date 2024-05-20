import mongoose from "mongoose";

const url = 'mongodb+srv://ig25347869:LPiRkpAXVfm7YxSw@cluster0.dpsvjnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

 
export const db = ()=>{
    mongoose.connect(url)
    .then(()=>{console.log("connection is successfull")})
    .catch((err)=>{console.log("error occures" + err )}); 
}

