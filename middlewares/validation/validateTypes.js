/**
 * Middleware che controlla che i valori dei campi nel body corrispondano
 * ai tipi specificati nello schema.
 *
 * Genera un errore 400 se uno o più campi non hanno il tipo corretto.
 *
 * @function validateTypes
 * @param {Object.<string, string>} schema - Oggetto che mappa ciascun campo
 *        al tipo previsto (es. { title: "string", likes: "number" })
 * @returns {import("express").RequestHandler} Middleware Express pronto all’uso
 *
 * @example
 * // Controlla che title sia string e likes sia number
 * router.post(
 *   "/",
 *   validateTypes({
 *     title: "string",
 *     likes: "number"
 *   }),
 *   controller.store
 * );
 */ // controlla che, dato lo schema di un oggetto {title:"string", likes:"number", published:"boolean"}, i valori di ogni chiave siano del tipo corretto
export const validateTypes = (schema) => {
  return (req, res, next) => {
    const invalidTypes = [];
    for (let key in schema) {
      if (key in req.body && typeof req.body[key] !== schema[key]) {
        invalidTypes.push(key);
      }
    }
    // se presente almeno un errore di tipo propaga un errore 400 con l'elenco delle chiavi il cui tipo non corrisponde a quanto richiesto
    if (invalidTypes.length !== 0) {
      const err = new Error("Campi non validi");
      err.status = 400;
      err.type = "validation";
      err.details = { invalidTypes };
      return next(err);
    }
    next();
  };
};
