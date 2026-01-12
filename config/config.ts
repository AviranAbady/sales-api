import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
}

const config: Config = {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV || 'development',
    dbHost: process.env.DB_HOST || '',
    dbPort: Number(process.env.DB_PORT),
    dbName: process.env.DB_NAME || '',
    dbUser: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASSWORD || '',
};

export default config;