import express from 'express'
import { createBook ,listBooks,updateBook ,getSingleBook, deleteBook } from './bookController';
import multer from 'multer';
import path from 'node:path';
import { authenticate } from '../../config/authenticate';
 
const bookRouter  = express.Router();

const upload = multer({
    dest : path.resolve(__dirname , '../public/data/uploads'),
    limits : {fileSize : 10 * 1024 * 1024} //10mb-cloudinary free plan offers 10mb only
})

bookRouter.post('/' ,authenticate , upload.fields([
    {name : 'coverImage' , maxCount : 1},
    {name : 'file' , maxCount : 1}
]) ,createBook)
 
bookRouter.put('/:bookId' ,authenticate , upload.fields([
    {name : 'coverImage' , maxCount : 1},
    {name : 'file' , maxCount : 1}
]) ,updateBook)
 
bookRouter.get('/' , listBooks);

bookRouter.get('/:bookId'  , getSingleBook);
bookRouter.delete('/:bookId'  , authenticate, deleteBook);
export default bookRouter;
