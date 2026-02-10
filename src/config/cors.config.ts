import { CorsOptions } from '../interfaces/common/cors-option.interface';
import { envConfig } from './env.config';

const corsOptions: CorsOptions = {
    origin: envConfig.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

export default corsOptions;
