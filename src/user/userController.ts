import { NextFunction , Request ,Response} from "express";
import bcrypt from 'bcrypt'; 
import userModel from "./userModel";
import createHttpError from "http-errors";
import {sign} from 'jsonwebtoken'
import { config } from "../../config/config";


const createUser = async(req:Request , res : Response ,next : NextFunction) =>{
    const {email , name , password} = req.body;

    if(!email || !name || !password){
        res.send('All fields are required');
    }
    //checking if user alerady exists or not in db
    const user = await userModel.findOne({email});
    if(user){
        const error = createHttpError(400 , "User already exists");
        return next(error);
    } 
    const hashedPassword = await bcrypt.hash(password , 10);
   //adding user into database
    const newUser = await userModel.create({
        name,
        email,
        password : hashedPassword
    })
    //token generation

    const token = sign({sub : newUser._id} , config.jwt_secret as string , {expiresIn : "7d"})
    return res.json({accessToken : token});
}

export {createUser}