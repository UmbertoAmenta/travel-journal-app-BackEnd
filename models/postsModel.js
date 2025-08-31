import { db } from "../database/db.js";

// Helper per convertire date italiane in formato MySQL (YYYY-MM-DD)
const formatDateForMySQL = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Richiede tutti i post
export const getPosts = async () => {
  const [rows] = await db.query(`
    SELECT 
      t.*,
      a.id AS album_id,
      a.url AS album_url,
      c.id AS company_id,
      c.name AS company_name
    FROM travels t
    LEFT JOIN albums a ON t.id = a.travel_id
    LEFT JOIN travel_companies tc ON t.id = tc.travel_id
    LEFT JOIN companies c ON tc.company_id = c.id
  `);

  const travelsMap = new Map();

  for (const row of rows) {
    if (!travelsMap.has(row.id)) {
      travelsMap.set(row.id, {
        id: row.id,
        title: row.title,
        description: row.description,
        locality: row.locality,
        initialDate: new Date(row.initialDate).toLocaleDateString("it-IT"),
        finalDate: new Date(row.finalDate).toLocaleDateString("it-IT"),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        album: [],
        company: [],
      });
    }

    const travel = travelsMap.get(row.id);

    if (row.album_url && !travel.album.includes(row.album_url)) {
      travel.album.push(row.album_url);
    }

    if (row.company_name && !travel.company.includes(row.company_name)) {
      travel.company.push(row.company_name);
    }
  }

  return Array.from(travelsMap.values());
};

// Richiede il singolo post
export const getPostById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT 
      t.*,
      a.id AS album_id,
      a.url AS album_url,
      c.id AS company_id,
      c.name AS company_name
    FROM travels t
    LEFT JOIN albums a ON t.id = a.travel_id
    LEFT JOIN travel_companies tc ON t.id = tc.travel_id
    LEFT JOIN companies c ON tc.company_id = c.id
    WHERE t.id = ?
  `,
    [id]
  );

  if (rows.length === 0) return null;

  const post = {
    id: rows[0].id,
    title: rows[0].title,
    description: rows[0].description,
    locality: rows[0].locality,
    initialDate: new Date(rows[0].initialDate).toLocaleDateString("it-IT"),
    finalDate: new Date(rows[0].finalDate).toLocaleDateString("it-IT"),
    createdAt: rows[0].createdAt,
    updatedAt: rows[0].updatedAt,
    album: [],
    company: [],
  };

  for (const row of rows) {
    if (row.album_url && !post.album.includes(row.album_url)) {
      post.album.push(row.album_url);
    }
    if (row.company_name && !post.company.includes(row.company_name)) {
      post.company.push(row.company_name);
    }
  }

  return post;
};

// Invia il singolo post
export const createPost = async (post) => {
  const {
    title,
    locality,
    album,
    description,
    company,
    initialDate,
    finalDate,
  } = post;

  if (!Array.isArray(album) || album.length === 0) {
    throw new Error("Il viaggio deve avere almeno un elemento nell'album");
  }

  // Start transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Converti date
    const initial = formatDateForMySQL(initialDate);
    const final = formatDateForMySQL(finalDate);

    // Inserimento viaggio
    const [travelResult] = await conn.query(
      "INSERT INTO travels (title, description, locality, initialDate, finalDate) VALUES (?, ?, ?, ?, ?)",
      [title, description, locality, initial, final]
    );
    const travelId = travelResult.insertId;

    // Inserimento album
    const albumValues = album.map((url) => [travelId, url]);
    await conn.query("INSERT INTO albums (travel_id, url) VALUES ?", [
      albumValues,
    ]);

    // Inserimento company e travel_companies
    if (Array.isArray(company) && company.length > 0) {
      for (const name of company) {
        // controlla se il compagno di viaggio è già presente nel db
        const [existing] = await conn.query(
          "SELECT id FROM companies WHERE name = ?",
          [name]
        );
        let companyId;
        if (existing.length > 0) {
          companyId = existing[0].id;
        } else {
          const [companyResult] = await conn.query(
            "INSERT INTO companies (name) VALUES (?)",
            [name]
          );
          companyId = companyResult.insertId;
        }

        // inserisci relazione travel_companies
        await conn.query(
          "INSERT INTO travel_companies (travel_id, company_id) VALUES (?, ?)",
          [travelId, companyId]
        );
      }
    }

    // Commit transaction
    await conn.commit();
    return travelId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Invia dati parziali del singolo post
export const updatePost = async (id, post) => {
  const {
    title,
    locality,
    album,
    description,
    company,
    initialDate,
    finalDate,
  } = post;

  if (!Array.isArray(album) || album.length === 0) {
    throw new Error("Il viaggio deve avere almeno un elemento nell'album");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Aggiorna tabella travels
    const initial = formatDateForMySQL(initialDate);
    const final = formatDateForMySQL(finalDate);
    await conn.query(
      "UPDATE travels SET title = ?, description = ?, locality = ?, initialDate = ?, finalDate = ? WHERE id = ?",
      [title, description, locality, initial, final, id]
    );

    // Aggiorna album: cancella i vecchi e inserisci i nuovi
    await conn.query("DELETE FROM albums WHERE travel_id = ?", [id]);
    const albumValues = album.map((url) => [id, url]);
    await conn.query("INSERT INTO albums (travel_id, url) VALUES ?", [
      albumValues,
    ]);

    // Aggiorna company
    await conn.query("DELETE FROM travel_companies WHERE travel_id = ?", [id]);
    if (Array.isArray(company) && company.length > 0) {
      for (const name of company) {
        // controlla se la company esiste
        const [existing] = await conn.query(
          "SELECT id FROM companies WHERE name = ?",
          [name]
        );
        let companyId;
        if (existing.length > 0) {
          companyId = existing[0].id;
        } else {
          const [companyResult] = await conn.query(
            "INSERT INTO companies (name) VALUES (?)",
            [name]
          );
          companyId = companyResult.insertId;
        }

        // inserisci relazione
        await conn.query(
          "INSERT INTO travel_companies (travel_id, company_id) VALUES (?, ?)",
          [id, companyId]
        );
      }
    }

    await conn.commit();
    return id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Elimina dati singolo post
export const deletePost = async (id) => {
  await db.query("DELETE FROM travels WHERE id = ?", [id]);
};
