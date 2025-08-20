import { getPosts, savePosts, generateId } from "../models/postsModel.js";

const index = (req, res) => {
  const posts = getPosts();
  res.json({ data: posts });
};

const show = (req, res) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.id);

  if (!post) return res.status(404).json({ error: "Post non trovato" });

  res.json({ data: post });
};

const store = (req, res) => {
  const {
    title,
    locality,
    album,
    description,
    company,
    initialDate,
    finalDate,
  } = req.body;

  //  verifica che tutti i campi siano presenti nel corpo della richiesta
  if (
    !title ||
    !locality ||
    !album ||
    !description ||
    !company ||
    !initialDate ||
    !finalDate
  ) {
    return res.status(400).json({
      error: true,
      message: "All fields are required",
    });
  }

  //  recupero posts
  const posts = getPosts();

  //  aggiunta nuovo post al database
  const newPost = {
    id: generateId(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locality,
    album,
    description,
    company,
    initialDate,
    finalDate,
  };
  posts.push(newPost);

  savePosts(posts);
  res.status(201).json({
    data: newPost,
  });
};

const modify = (req, res) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.id);

  if (!post) return res.status(404).json({ error: "Post non trovato" });

  // Object.assign(target, ...sources)
  //  superficiale come lo spread operator ma modifica direttamente le proprietà modificate (non crea una nuova copia del post)
  Object.assign(post, req.body, { updatedAt: new Date().toISOString() });

  savePosts(posts);
  res.json({ data: post });
};

const destroy = (req, res) => {
  const posts = getPosts();

  // selezione del post ed eliminazione diretta
  const indexToDelete = posts.findIndex((p) => p.id === req.id);
  if (indexToDelete === -1)
    return res.status(404).json({ error: "Post non trovato" });
  // splice restituisce un array, con [0] seleziono direttamente l'oggetto
  const deletedPost = posts.splice(indexToDelete, 1)[0];

  savePosts(posts);
  res.json({ data: deletedPost });
};

export { index, show, store, modify, destroy };
