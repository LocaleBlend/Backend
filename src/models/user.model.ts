import mongoose, { Model, Document } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const AccessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ?? "My Default Access Token Secret"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  age: number
  avatar: string
  coverImage?: string
  generateAccessToken(): string
  isPasswordCorrect(password: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
)

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    },
    AccessTokenSecret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema)
