const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Uploads an in-memory file buffer (from multer.memoryStorage) to Cloudinary
// and resolves with the resulting secure URL.
const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;