import 'dotenv/config'
import connectDB from './db/index.js';
import { PORT } from './constants.js';
import { app } from './app.js';

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port : ${PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})