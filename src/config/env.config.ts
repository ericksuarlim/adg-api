import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || '',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    /** Max cached tenant Sequelize connections per API process (LRU eviction). */
    TENANT_POOL_MAX: process.env.TENANT_POOL_MAX ? Number(process.env.TENANT_POOL_MAX) : undefined,
    PORT: process.env.PORT || '3010',
    JWT_SECRET: process.env.JWT_SECRET || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4730',
    /**
     * When true, SaaS Sequelize sync uses alter mode so missing columns/tables are created from models.
     * Use only in trusted dev/staging; prefer scripts/saas-tenant-rollout-ddl.sql in production.
     */
    DB_SYNC_ALTER: process.env.DB_SYNC_ALTER === 'true' || process.env.DB_SYNC_ALTER === '1',
};
