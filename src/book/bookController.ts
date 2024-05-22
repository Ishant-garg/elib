// import { NextFunction, Request, Response } from "express";
// import path from "node:path";
// import cloudinary from "../../config/cloudinary";


// const createBook = async  (req: Request, res: Response, next: NextFunction) =>{
//     console.log("files  : " , req.files);

//     const files = req.files as {[fieldname : string]:Express.Multer.File[]};
    
//     const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
//     const filename = files.coverImage[0].filename
//     const filePath = path.resolve(__dirname , "../../public/data/uploads" , filename);

//     try{
//         const uploadResult = await cloudinary.uploader.upload(filePath , {
//             filename_override : filename,
//             folder : "book-covers",
//             format : coverImageMimeType
//         })

//         console.log(uploadResult);
//     }catch(err){
//         console.log(err);
//     }

//     res.json({})
// }


// export {createBook}
import cloudinary from "../../config/cloudinary";
import path from 'path';
import fs from 'fs';
import { Request, Response } from "express";
import bookModel from "./bookModel";
import { AuthRequest } from "../../config/authenticate";
import { NextFunction } from "express-serve-static-core";
import createHttpError from "http-errors";
// Configure Cloudinary


  const createBook = async (req : Request, res : Response) => {
  try {
    // console.log("files  : " , req.files);
    const {title , genre} = req.body;
    const files = req.files as {[fieldname : string]:Express.Multer.File[]}

    // Upload files to Cloudinary
    const coverImagePath = files.coverImage[0].path;
    const filePath = files.file[0].path;
    // const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filename = files.coverImage[0].filename

    const bookPdfname = files.file[0].filename

    const coverImageUpload = await cloudinary.uploader.upload(coverImagePath ,{
        folder : "book-covers",
        filename_override : filename
    });
    const fileUpload = await cloudinary.uploader.upload(filePath,{
        folder : "book-pdfs",
        filename_override : bookPdfname
    });

    const _req = req as AuthRequest

    const newBook = await bookModel.create({
        title,
        author : _req.userId,
        genre,
        file : fileUpload.secure_url,
        coverImage : coverImageUpload.secure_url

    })
    // Delete the files from the local uploads directory
    fs.unlinkSync(coverImagePath);
    fs.unlinkSync(filePath);

    // Return the Cloudinary URLs
    res.status(200).json({
      coverImageUrl: coverImageUpload.secure_url,
      fileUrl: fileUpload.secure_url
    });
  } catch (error) {
    console.error('Error uploading files to Cloudinary:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateBook = async (req : Request, res : Response , next : NextFunction) => {
  const {title , genre} = req.body;
  const files = req.files as {[fieldname : string]:Express.Multer.File[]};

  const bookId = req.params.bookId;

  if(!bookId){
    return next(createHttpError(400 , 'bookid not provided'));
  }

  const book = await bookModel.findOne({_id : bookId});

  if(!book){
    return next(createHttpError(404 ,'book not found'));
  }

  const _req  = req as AuthRequest;

  const userID = _req.userId;

  if(book.author.toString() !== userID){
    return next(createHttpError(401 , 'you are not the author'));

  } 

  let completeCoverImage = '';

  if(files.coverImage){
    const coverImagePath = files.coverImage[0].path;
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filename = files.coverImage[0].filename

    

    const coverImageUpload = await cloudinary.uploader.upload(coverImagePath ,{
        folder : "book-covers",
        filename_override : filename,
        format : coverImageMimeType
    });

    completeCoverImage = coverImageUpload.secure_url
    fs.unlinkSync(coverImagePath);
   
  }

  let completeBookpdf = '';
  if(files.file){
    const filePath = files.file[0].path;
  
    const bookPdfname = files.file[0].filename
 
    const fileUpload = await cloudinary.uploader.upload(filePath,{
        folder : "book-pdfs",
        filename_override : bookPdfname,
        format : "pdf"
    });
    completeBookpdf = fileUpload.secure_url;
    fs.unlinkSync(filePath);

   
  }

  const updatedBook = await bookModel.findOneAndUpdate({
    _id : bookId
  },{
    title : title,
    genre : genre,
    coverImage : completeCoverImage ? completeCoverImage : book.coverImage,
    file : completeBookpdf ? completeBookpdf  : book.file,
   },{
    new : true
   })

  return res.json(book);

}

const listBooks = async (req : Request, res : Response , next : NextFunction) => {
    

    try{
      const book = bookModel.find();
      return res.json({book});
    }
    catch(err){
      return next(createHttpError(401 , 'no book found'));
    }
}

const getSingleBook = async (req : Request, res : Response , next : NextFunction) => {
    const bookId = req.params.bookID;
    
     

  try{
    const book = bookModel.findOne({_id : bookId});
    if(!book){
      return next(createHttpError(401 , 'no book found'));
    }
    return res.json({book});
  }
  catch(err){
    return next(createHttpError(401 , 'no book found'));
  }
}

const deleteBook = async (req : Request, res : Response , next : NextFunction) => {
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({_id : bookId});
    if(!book) {
      return next(createHttpError(401 , 'book not found'));
    }
    const _req  = req as AuthRequest;

    const userID = _req.userId;
    if(book.author.toString() !== userID){
      return next(createHttpError(401 , 'you are not the author'));
  
    } 

    const bookCoverLink = book.coverImage.split('/');
    const destroyCover = bookCoverLink.at(-2) +'/' +bookCoverLink.at(-1)?.split('.').at(-2); 


    const bookPdfLink = book.file.split('/');
    const destroyPdf = bookPdfLink.at(-2) +'/' +bookPdfLink.at(-1)?.split('.').at(-2); 

    await cloudinary.uploader.destroy(destroyCover);
    await cloudinary.uploader.destroy(destroyPdf,{
      resource_type:"raw"
    });

    await bookModel.deleteOne({_id : bookId});
    return res.status(204).json({});

}
export {createBook , updateBook , listBooks ,getSingleBook ,deleteBook}