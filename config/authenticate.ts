import { NextFunction , Request , Response} from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "./config";

export interface AuthRequest extends Request {
    userId : string
}
 export const authenticate =async (req:Request , res :Response, next : NextFunction)=>{

    const token = req.header('Authorization') ;

    if(!token){
        return next(createHttpError(400, 'Authorization token is required'));
    }

    const parseToken = token.split(" ")[1];

    try{
        const decoded = verify(parseToken , config.jwt_secret as string);
        console.log('decoded ' , decoded)
        const _req = req as AuthRequest;
    
        _req.userId = decoded.sub as string;
    }catch(err){
        return next(createHttpError(401 ,'token expired'))
    }
  

    next();



}