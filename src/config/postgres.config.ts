import { envConfig } from './env';

const pgConfig = {
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    database: envConfig.DB_NAME,
    host: envConfig.DB_HOST,
    port: envConfig.DB_PORT,
    ssl: false,
};

export default pgConfig;