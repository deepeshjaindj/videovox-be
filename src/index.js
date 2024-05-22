import express from 'express';
import { PORT } from './constants.js';
import connectDB from './db/index.js';
import 'dotenv/config'

const app = express();

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})