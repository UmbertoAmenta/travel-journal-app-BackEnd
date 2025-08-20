/**
 * Middleware che controlla la presenza di campi obbligatori nel body della richiesta.
 *
 * - Verifica che tutti i campi specificati siano presenti in `req.body`.
 * - Se manca uno o più campi richiesti, genera un errore 400 di validazione.
 * - Se sono tutti presenti, passa al middleware successivo.
 *
 * @function requiredInputs
 * @param {string[]} fields - Lista dei nomi dei campi obbligatori
 * @returns {import("express").RequestHandler} Middleware Express pronto all’uso
 *
 * @example
 * // Richiede che il body contenga almeno "title" e "description"
 * router.post(
 *   "/",
 *   requiredInputs(["title", "description"]),
 *   controller.store
 * );
 */
// controlla che i campi indicati nell'array inputs siano presenti nel corpo della richiesta
export const requiredInputs = (inputs) => {
  return (req, res, next) => {
    const missingInputs = inputs.filter(
      (i) => !Object.keys(req.body || {}).includes(i)
    );

    // se almeno uno dei campi richiesti è assente propaga l'errore, altrimenti passa i dati al prossimo middleware
    if (missingInputs.length > 0) {
      const err = new Error("Campi mancanti");
      err.status = 400;
      err.type = "validation";
      err.details = { missingInputs };
      return next(err);
    }
    next();
  };
};
