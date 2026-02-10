import { envConfig } from './env.config';

const databaseConfig = {
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    database: envConfig.DB_NAME,
    host: envConfig.DB_HOST,
    port: envConfig.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: false,
    },
};

export default databaseConfig;