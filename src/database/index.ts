import { Sequelize } from 'sequelize';
import dbConfig from '../config/database.config';

const sequelize = new Sequelize(
    dbConfig.database as string,
    dbConfig.user as string,
    dbConfig.password as string,
    {
            host: dbConfig.host,
            port: Number(dbConfig.port),
            dialect: 'postgres',
            logging: dbConfig.logging,
            dialectOptions: dbConfig.dialectOptions,
    }
);

export default sequelize;

