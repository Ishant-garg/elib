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
// Configure Cloudinary


export const createBook = async (req : Request, res : Response) => {
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
