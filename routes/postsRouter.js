import express from "express";

import {
  index,
  show,
  store,
  modify,
  destroy,
} from "../controllers/postsController.js";

const router = express.Router();

// Index
router.get("/", index);

// Show
router.get("/:id", show);

// Store
router.post("/", store);

// Modify
router.patch("/:id", modify);

// Destroy
router.delete("/:id", destroy);

export default router;
