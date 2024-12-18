import mongoose, { MongooseError } from "mongoose"
import { DB_NAME } from "../constants"

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    )
    console.log(
      `\n Mongo Db connected !! DB Host: ${connectionInstance.connection.host}`
    )
  } catch (error) {
    const customErr = error as MongooseError
    console.log("Mongo DB connection error! :", customErr)
    process.exit(1)
  }
}

export default connectDB
