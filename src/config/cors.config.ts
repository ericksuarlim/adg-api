import { CorsOptions } from '../interfaces/common/corsOption.interface';
import { envConfig } from './env';

const corsOptions: CorsOptions = {
    origin: envConfig.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

export default corsOptions;
