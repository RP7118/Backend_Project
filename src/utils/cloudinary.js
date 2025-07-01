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
        console.log(response);
        return response;
        
    }catch(error){
        fs.unlinkSync(local_file_path)
        return null;
    };
    

}

const deletFileFromCloudinary = async (cloudinaryPath)=>{

    const parts = cloudinaryPath.split("/") 
    const filenamewithdot = parts[parts.length - 1]
    const filename = filenamewithdot.split(".")[0]

    const foldername = parts.slice(parts.length -2,parts.length -1)
    const folderpath = foldername.join("/")

    const public_id = `${folderpath}/${filename}`

    cloudinary.uploader.destroy(public_id)

    console.log("file has been deleted from cloudinary")
}

export {uploadFileOnCloudinary,deletFileFromCloudinary}