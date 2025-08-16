import express from "express";
import dotenv from "dotenv";

import postsRouter from "./routes/postsRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/posts", postsRouter);

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
