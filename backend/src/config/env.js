export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  cookieSecret: process.env.COOKIE_SECRET || 'kortex_session_secret_2026',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};
