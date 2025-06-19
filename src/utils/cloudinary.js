import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadFileOnCloudinary = async (local_file_path) => {
    try{
        if(!local_file_path) return null
       const response = await cloudinary.uploader.upload(local_file_path,{
            resource_type: "auto"
        })
        //file successfully uploaded

        console.log("file has been uploaded",response.url);
        return response;
    }catch(error){
        fs.unlinkSync(local_file_path)
        return null;
    };
    

}