import express from "express";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//  gestione database
//   recupero posts
const getPosts = () => {
  try {
    const postsString = fs.readFileSync("./database/posts.json", "utf-8");
    return JSON.parse(postsString);
  } catch (error) {
    console.error("Errore nella lettura del database:", error);
    return [];
  }
};

//   salvataggio dati posts
const savePosts = (posts) => {
  const postsString = JSON.stringify(posts, null, 2);
  fs.writeFileSync("./database/posts.json", postsString, "utf-8");
};

//  generazione progressiva id per ogni nuovo post
const generateId = () => {
  const posts = getPosts();
  const ids = posts.map((p) => p.id);
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return maxId + 1;
};

// Index
app.get("/posts", (req, res) => {
  const posts = getPosts();
  res.json({ data: posts });
});

// Show
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const post = posts.find((p) => p.id == id);

  if (!post) return res.status(404).send({ error: "Post non trovato" });

  res.json({ data: post });
});

// Store
app.post("/posts", (req, res) => {
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
    return res.status(400).send({
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
});

// Modify
app.patch("/posts/:id", (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const post = posts.find((p) => p.id == id);

  if (!post) return res.status(404).send({ error: "Post non trovato" });

  // Object.assign(target, ...sources)
  //  superficiale come lo spread operator ma modifica direttamente le proprietà modificate (non crea una nuova copia del post)
  Object.assign(post, req.body, { updatedAt: new Date().toISOString() });

  savePosts(posts);
  res.json({ data: post });
});

// Destroy
app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;
  const posts = getPosts();

  // selezione del post ed eliminazione diretta
  const indexToDelete = posts.findIndex((p) => p.id == id);
  if (indexToDelete === -1)
    return res.status(404).send({ error: "Post non trovato" });
  // splice restituisce un array, con [0] seleziono direttamente l'oggetto
  const deletedPost = posts.splice(indexToDelete, 1)[0];

  savePosts(posts);
  res.json({ data: deletedPost });
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
