import express from 'express'
import createHttpError from 'http-errors';
import { globalError } from './middlewares/globalErrorHandler';

 
const app = express();


app.get('/' , (req , res) =>{
    const error =  createHttpError(505 , "hi iam error");
    throw error;
    res.send('hiii')
})
 
app.use(globalError)

export default app;