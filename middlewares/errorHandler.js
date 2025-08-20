/**
 * Middleware globale per la gestione degli errori.
 *
 * Centralizza tutte le risposte di errore generate dai middleware
 * o dai controller. Se l'errore non contiene uno status, assume
 * 500 (errore interno del server). Se non contiene un tipo,
 * distingue tra "client error" (<500) e "server error" (>=500).
 *
 * @function errorHandler
 * @param {Error & {status?: number, type?: string, details?: any}} err - L'oggetto errore
 * @param {import("express").Request} req - La richiesta Express
 * @param {import("express").Response} res - La risposta Express
 * @param {import("express").NextFunction} next - La funzione next di Express
 * @returns {void} Invia una risposta JSON con lo status e i dettagli dell'errore
 *
 * @example
 * // In app.js o server.js
 * app.use(errorHandler);
 */ // centralizza la gestione degli errori
export const errorHandler = (err, req, res, next) => {
  // nel caso in cui l'errore superi i controlli
  const status = err.status || 500;
  const type = err.type || (status < 500 ? "client error" : "server error");

  // invia l'errore
  res.status(status).json({
    error: { type, message: err.message || "Errore interno del server" },
    details: err.details || null,
  });
};
