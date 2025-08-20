/**
 * Middleware che valida il parametro `id` presente nei parametri della rotta.
 *
 * - Converte `req.params.id` in numero.
 * - Se non è un numero valido, genera un errore 400 di validazione.
 * - Se è valido, lo salva come `req.id` per comodità nei controller successivi.
 *
 * @function validationParamsId
 * @param {import("express").Request} req - L’oggetto Request di Express
 * @param {import("express").Response} res - L’oggetto Response di Express
 * @param {import("express").NextFunction} next - La funzione di callback per passare al middleware successivo
 * @returns {void} Non restituisce nulla direttamente, chiama `next()` per proseguire
 *
 * @example
 * // Esempio di utilizzo in una rotta
 * router.get("/:id", validationParamsId, (req, res) => {
 *   // Se arrivo qui, req.id è già un numero valido
 *   res.json({ id: req.id });
 * });
 */
// controlla che il parametro id sia numerico, altrimenti restituisce un errore
export const validationParamsId = (req, res, next) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    const err = new Error("Il parametro id deve essere numerico");
    err.status = 400;
    err.type = "validation";
    return next(err);
  }

  req.id = id;
  next();
};
