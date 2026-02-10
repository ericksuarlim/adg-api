import app from './src/app';
import sequelize from './src/database/index';
import {envConfig} from "./src/config";


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

