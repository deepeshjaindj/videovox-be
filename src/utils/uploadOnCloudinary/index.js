import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../../constants';
          
// Configures the cloudinary module with the provided cloud name, API key, and API secret.
cloudinary.config({ 
  cloud_name: CLOUDINARY_CLOUD_NAME, 
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary.
 * 
 * @param {string} localFilePath - The local file path of the file to be uploaded.
 * @returns {Object|null} - The response object from Cloudinary if successful, otherwise null.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export default uploadOnCloudinary;
