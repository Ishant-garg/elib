import { NextFunction , Request ,Response} from "express";
import bcrypt from 'bcrypt'; 
import userModel from "./userModel";
import createHttpError from "http-errors";


const createUser = async(req:Request , res : Response ,next : NextFunction) =>{
    const {email , name , password} = req.body;

    if(!email || !name || !password){
        res.send('All fields are required');
    }
 
    const user = await userModel.findOne({email});
    if(user){
        const error = createHttpError(400 , "User already exists");
        return next(error);
    } 
    const hashedPassword =  bcrypt.hash(password , 10);

    const newUser = await userModel.create({
        name,
        email,
        password : hashedPassword
    })
    return res.json({_id : newUser._id});
}

export {createUser}