import type { CorsOptions } from 'cors';
import { envConfig } from './env.config';

function allowedOriginsFromEnv(): string[] {
    const raw = envConfig.CORS_ORIGIN || 'http://localhost:4730';
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
}

const devLocalOrigin = (origin: string | undefined): boolean => {
    if (!origin) {
        return true;
    }
    try {
        const { hostname } = new URL(origin);
        return hostname === 'localhost' || hostname === '127.0.0.1';
    } catch {
        return false;
    }
};

const corsOptions: CorsOptions = {
    origin:
        envConfig.NODE_ENV === 'production'
            ? allowedOriginsFromEnv()
            : (origin, callback) => {
                  if (devLocalOrigin(origin)) {
                      callback(null, true);
                      return;
                  }
                  const list = allowedOriginsFromEnv();
                  if (origin && list.includes(origin)) {
                      callback(null, true);
                      return;
                  }
                  callback(null, false);
              },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
};

export default corsOptions;
