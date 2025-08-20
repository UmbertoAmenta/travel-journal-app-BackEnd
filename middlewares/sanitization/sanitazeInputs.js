/**
 * Middleware che sanifica i campi specificati nel body della richiesta.
 *
 * Attualmente supporta solo la sanitizzazione "trim" per rimuovere
 * spazi iniziali e finali dalle stringhe.
 *
 * In futuro è facilmente estendibile aggiungendo altre regole
 * all'interno del ciclo `for`.
 *
 * @function sanitizeInputs
 * @param {Object.<string, string>} rules - Oggetto che mappa ciascun campo
 *        con la regola di sanitizzazione da applicare (es. { title: "trim" })
 * @returns {import("express").RequestHandler} Middleware Express pronto all’uso
 *
 * @example
 * // Rimuove spazi iniziali e finali da title e description
 * router.post(
 *   "/",
 *   sanitizeInputs({
 *     title: "trim",
 *     description: "trim"
 *   }),
 *   controller.store
 * );
 */
// sanifica l'input con il metodo richiesto
export const sanitizeInputs = (rules) => {
  return (req, res, next) => {
    for (let key in rules) {
      const rule = rules[key];
      const value = req.body[key];

      if (value !== undefined) {
        // trim -> rimuove spazi iniziali/finali dalle stringhe
        if (rule === "trim" && typeof value === "string") {
          req.body[key] = value.trim();
        }
      }

      // possibile aggiungere nuove regole per altri tipi di sanificazione
    }
    next();
  };
};
