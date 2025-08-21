import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.nextTick.CLOUDINARY_API_SECRET 
    });
    
    // Upload an image
     const uploadOnCloudinary = async (localFilePath) => {
        try{
            if (!localFilePath) return null
            // upload file on cloudinary
            const response =await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            //file have been uploaded successfully
            console.log("file is uploade on cloudinary",response.url);
            return response;
        }catch(error){
            fs.unlinkSync(localFilePath)// remove the locally save the temporary file as the upload operation failed
            return null;
        }
     }

      
export {uploadOnCloudinary}