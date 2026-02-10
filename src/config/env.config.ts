import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || '',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    PORT: process.env.PORT || '3000',
    JWT_SECRET: process.env.JWT_SECRET || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200',
};
