import fs from "fs";

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

export { getPosts, savePosts, generateId };
