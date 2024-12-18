import app from "./app"
import dotenv from "dotenv"
import connectDB from "./db"

dotenv.config({
  path: "./.env",
})

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log(`App failed to run because of:  ${err}`)
      throw err
    })
    app.listen(process.env.PORT || 8001, () => {
      console.log(`Server is running at port ${process.env.PORT || 8001}`)
    })
  })
  .catch((err) => {
    console.log("Mongo db failed to connect! ", err)
  })
