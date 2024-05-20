import app from "../app";
import express, { Request , Response, NextFunction } from 'express'
import createHttpError, { HttpError } from 'http-errors';
 
export const globalError = ((err : HttpError , req : Request , res : Response , next  : NextFunction) =>{
    const statusCode    = err.statusCode ;
    
    return res.status(200).json({
        message : err.message,
        stack : err.stack,
        code :   err.statusCode
    })
})

 