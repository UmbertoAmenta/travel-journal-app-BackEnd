/**
 * Middleware che controlla che nel body della richiesta siano presenti
 * solo i campi ammessi.
 *
 * - Se ci sono campi non previsti, genera un errore 400 di validazione.
 * - Se tutti i campi sono consentiti, passa al middleware successivo.
 *
 * @function allowedFields
 * @param {string[]} fields - Lista dei nomi dei campi consentiti
 * @returns {import("express").RequestHandler} Middleware Express pronto all’uso
 *
 * @example
 * // Permette solo i campi "title", "description" e "locality"
 * router.post(
 *   "/",
 *   allowedFields(["title", "description", "locality"]),
 *   controller.store
 * );
 */
// dato un array di campi validi, controlla che tutti i campi inseriti vi siano inclusi
export const allowedFields = (fields) => {
  return (req, res, next) => {
    const notAllowed = Object.keys(req.body || {}).filter((k) => {
      return !fields.includes(k);
    });

    // se almeno uno dei campi non è permesso propaga un errore, altrimenti passa i dati al prossimo middleware
    if (notAllowed.length > 0) {
      const err = new Error("Campi non validi");
      err.status = 400;
      err.type = "validation";
      err.details = { notAllowed };
      return next(err);
    }
    next();
  };
};
