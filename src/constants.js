// Database
export const DB_NAME = 'videovox';
export const MONGODB_URI = process.env.MONGODB_URI;

// Server
export const PORT = process.env.PORT;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;

// JWT
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;


export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true
};
