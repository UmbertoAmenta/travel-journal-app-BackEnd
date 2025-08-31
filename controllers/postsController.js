import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../models/postsModel.js";

const index = async (req, res, next) => {
  try {
    const posts = await getPosts();
    res.json({ data: posts });
  } catch (error) {
    next(error);
  }
};

const show = async (req, res, next) => {
  try {
    const posts = await getPosts();
    const post = posts.find((p) => p.id === parseInt(req.params.id));

    if (!post) {
      return res.status(404).json({ error: "Viaggio non trovato" });
    }

    res.json({ data: [post] });
  } catch (error) {
    next(error);
  }
};

const store = async (req, res, next) => {
  try {
    const {
      title,
      locality,
      album,
      description,
      company,
      initialDate,
      finalDate,
    } = req.body;

    // Controllo campi obbligatori
    if (
      !title ||
      !locality ||
      !description ||
      !initialDate ||
      !finalDate ||
      !Array.isArray(album) ||
      album.length === 0 ||
      !Array.isArray(company)
    ) {
      return res.status(400).json({
        error: true,
        message: "Campi obbligatori mancanti o non validi",
      });
    }

    // Creazione post nel database
    const insertId = await createPost({
      title,
      locality,
      album,
      description,
      company,
      initialDate,
      finalDate,
    });

    // Ricreo l'oggetto completo da restituire al client
    const newPost = {
      id: insertId,
      title,
      locality,
      album,
      description,
      company,
      initialDate,
      finalDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json({ data: newPost });
  } catch (error) {
    next(error);
  }
};

const modify = async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    // Recupera il post esistente
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Viaggio non trovato" });
    }

    // Se nell'update non viene passato album, mantieni quello esistente
    const album = Array.isArray(req.body.album)
      ? req.body.album
      : existingPost.album;

    // Se dopo l'update l'album risultasse vuoto, errore
    if (!album || album.length === 0) {
      return res.status(400).json({
        error: "Al viaggio deve essere associato almeno un elemento nell'album",
      });
    }

    // Gli altri campi si aggiornano come passati (o rimangono invariati)
    const updateData = {
      title: req.body.title ?? existingPost.title,
      description: req.body.description ?? existingPost.description,
      locality: req.body.locality ?? existingPost.locality,
      initialDate: req.body.initialDate ?? existingPost.initialDate,
      finalDate: req.body.finalDate ?? existingPost.finalDate,
      album,
      company: Array.isArray(req.body.company)
        ? req.body.company
        : existingPost.company,
    };

    await updatePost(id, updateData);

    const updatedPost = await getPostById(id);
    res.json({ data: [updatedPost] });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    // Controlla che il post esista
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Viaggio non trovato" });
    }

    // Elimina il post
    await deletePost(id);

    res.json({ data: [existingPost] });
  } catch (error) {
    next(error);
  }
};

export { index, show, store, modify, destroy };
