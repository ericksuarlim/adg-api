import express from 'express';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middlewares/error.middleware';
import corsOptions from './config/cors.config';

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

export default app;
