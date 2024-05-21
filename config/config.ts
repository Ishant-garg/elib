import { config as conf } from "dotenv"
conf();

const _config = {
    port : process.env.PORT,
    jwt_secret : process.env.JWT_SECRET,
    api_key : process.env.API_KEY,
    cloud_name : process.env.CLOUD_NAME,
    api_secret : process.env.API_SECRET
}

export const config = Object.freeze(_config)