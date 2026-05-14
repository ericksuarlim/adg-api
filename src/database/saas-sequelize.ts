import { Sequelize } from 'sequelize';
import dbConfig from '../config/database.config';

/**
 * Primary Sequelize connection for the SaaS catalog database (companies, users,
 * sessions, billing, memberships). Operational ranch/animal data lives in per-company tenant databases.
 */
const saasSequelize = new Sequelize(
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

export default saasSequelize;
