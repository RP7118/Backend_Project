import momgoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dotenv from "dotenv"
dotenv.config();

const connectDB = async () => {
    try {
        const connectionInstanace = await momgoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("DATABASE CONNECTION SUCCESSFUL", connectionInstanace.connection.host, connectionInstanace.connection.name);
    } catch(error) {
        console.log("DATABASE COONECTION FAILED" , error)
    }
}

export default connectDB;