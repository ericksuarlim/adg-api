import app from './app';
import sequelize from './database';
import {envConfig} from "./config";
import './database/models';

sequelize.authenticate()
    .then(() => {
        console.log('Database connected');
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        app.listen(envConfig.PORT, () => {
            console.log(`Server running on http://localhost:${envConfig.PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error('Unable to connect to database:', err.message);
        process.exit(1);
    });

