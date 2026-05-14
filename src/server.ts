import app from './app';
import sequelize from './database';
import {envConfig} from "./config";
import './database/models';

process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected');
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        const port = Number(envConfig.PORT) || 3010;
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${port} (localhost:${port})`);
        });
    })
    .catch((err: Error) => {
        console.error('Unable to connect to database:', err.message);
        process.exit(1);
    });

