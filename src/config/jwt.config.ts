import { envConfig } from "./env.config";

const jwtConfig = {
    secret: envConfig.JWT_SECRET || 'fallback-secret',
    expiresIn: '1h',
}

export default jwtConfig;
