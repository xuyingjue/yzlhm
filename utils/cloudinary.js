const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// 配置Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 上传图片到Cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
  try {
    const result = await cloudinary.uploader.upload_stream({
      folder: folder || 'products',
      resource_type: 'auto'
    }).end(fileBuffer);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = {
  uploadToCloudinary
};