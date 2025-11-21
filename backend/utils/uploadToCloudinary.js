import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../db/cloudinary";

const storage = multer.memoryStorage();  //multer= package for handling images => created a temporary memory storage
const upload = multer({storage})

const uploadToCloudinary = (fileBuffer, folderName = "uploads") =>{

    return new Promise((resolve, reject) => {
        const stream =cloudinary.uploader.upload_stream({folder: folderName}, (error, result)=>{
            if(result){
                resolve(result)
            }else(
                reject(error)
            )
        })
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

export {upload, uploadToCloudinary}

