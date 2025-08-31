import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import postsRouter from "./routers/postsRouter.js";

import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// abilitazione cors al solo dominio di sviluppo, al momento
const allowedOrigin = process.env.CLIENT_URL;
app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json());

app.use("/posts", postsRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
