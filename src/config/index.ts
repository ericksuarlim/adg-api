const databaseConfig = require('./database');
const jwtConfig = require('./jwt');
const corsConfig = require('./cors');
const envConfig = require('../../env');

module.exports = {
    databaseConfig,
    jwtConfig,
    corsConfig,
    envConfig,
};