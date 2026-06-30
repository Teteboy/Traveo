export const config = {
  port: parseInt(process.env.PORT ?? '3002', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'traveo-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'traveo-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/traveo',
}