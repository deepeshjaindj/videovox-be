import express from 'express';
import cors from 'cors';
import { CORS_ORIGIN } from './constants.js';
import cookieParser from 'cookie-parser';

const app = express();

/**
 * Middleware function to enable CORS with the specified origin and credentials.
 * 
 * @param {String} origin - The origin allowed for CORS requests.
 * @param {Boolean} credentials - Whether to include credentials in CORS requests.
 */
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}))

/**
 * Middleware function to parse incoming request data as JSON with a specified limit of 16kb.
 */
app.use(express.json({
  limit: '16kb',
}))

/**
 * Middleware function to parse urlencoded data with extended mode and a limit of 16kb.
 */
app.use(express.urlencoded({
  extended: true,
  limit: '16kb'
}))

/**
 * Middleware function to serve static files from the 'public' directory.
 */
app.use(express.static('public'))

/**
 * Middleware function to parse cookies in the incoming request.
 */
app.use(cookieParser())

export { app }