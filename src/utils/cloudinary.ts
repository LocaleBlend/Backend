import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })

    fs.unlinkSync(localFilePath)
    return response
  } catch (err) {
    fs.unlinkSync(localFilePath)
    console.log(err)
    return null
  }
}
