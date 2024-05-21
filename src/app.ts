import express from 'express'
import createHttpError from 'http-errors';
import { globalError } from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';
import bookRouter from './book/bookRouter';

 
const app = express();
app.use(express.json());

app.get('/' , (req , res) =>{

    res.send('hiii');
})

app.use('/api/users',userRouter);
app.use('/api/books',bookRouter);
app.use(globalError);

export default app;