declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number
    CORS_ORIGIN: string
    MONGODB_URI: string
    ACCESS_TOKEN_SECRET: string
    ACCESS_TOKEN_EXPIRY: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string
    CLOUD_NAME: string
  }
}
