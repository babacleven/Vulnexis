export const corsConfig = {
  origin: (origin, callback) => {
    // Permet les requêtes locales (Vite 5173, unified 3000, ou même origine)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};
