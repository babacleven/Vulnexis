export function errorMiddleware(err, req, res, next) {
  console.error('Erreur API non gérée:', err);
  const status = err.status || 500;
  res.status(status).json({
    code: status,
    msg: err.message || 'Une erreur interne est survenue sur le serveur.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
