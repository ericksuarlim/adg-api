import { Sequelize } from 'sequelize';
import dbConfig from '../config/database';

const sequelize = new Sequelize(
    dbConfig.database as string,
    dbConfig.username as string,
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

// Descomenta esto si quieres hacer una prueba de conexión al iniciar
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Conexión a base de datos establecida con éxito.');
//   } catch (error) {
//     console.error('No se pudo conectar a la base de datos:', (error as Error).message);
//   }
// })();
