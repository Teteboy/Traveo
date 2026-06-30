export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'traveo-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'traveo-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  campay: {
    username: process.env.CAMPAY_APP_USERNAME ?? '',
    password: process.env.CAMPAY_APP_PASSWORD ?? '',
    baseUrl: process.env.CAMPAY_BASE_URL ?? 'https://demo.campay.net/api',
  },

  duffel: {
    apiKey: process.env.DUFFEL_API_KEY ?? '',
    baseUrl: process.env.DUFFEL_BASE_URL ?? 'https://api.duffel.com',
  },

  cloudinary: {
    cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.VITE_CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.VITE_CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET ?? '',
  },

  upload: {
    dir: process.env.UPLOAD_DIR ?? 'uploads',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
  },
}
