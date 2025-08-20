import express from "express";

import { validationParamsId } from "../middlewares/params/validationParamsId.js";
import { requiredInputs } from "../middlewares/validation/requiredInputs.js";
import { allowedFields } from "../middlewares/validation/allowedFields.js";
import { sanitizeInputs } from "../middlewares/sanitization/sanitazeInputs.js";
import { validateTypes } from "../middlewares/validation/validateTypes.js";

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
router.get("/:id", validationParamsId, show);

// Store
router.post(
  "/",
  requiredInputs([
    "title",
    "locality",
    "album",
    "description",
    "company",
    "initialDate",
    "finalDate",
  ]),
  allowedFields([
    "title",
    "locality",
    "album",
    "description",
    "company",
    "initialDate",
    "finalDate",
  ]),
  sanitizeInputs({
    title: "trim",
    locality: "trim",
    description: "trim",
    initialDate: "trim",
    finalDate: "trim",
  }),
  validateTypes({
    title: "string",
    locality: "string",
    album: "object",
    description: "string",
    company: "object",
    initialDate: "string",
    finalDate: "string",
  }),
  store
);

// Modify
router.patch(
  "/:id",
  validationParamsId,
  allowedFields([
    "title",
    "locality",
    "album",
    "description",
    "company",
    "initialDate",
    "finalDate",
  ]),
  sanitizeInputs({
    title: "trim",
    locality: "trim",
    description: "trim",
    initialDate: "trim",
    finalDate: "trim",
  }),
  validateTypes({
    title: "string",
    locality: "string",
    album: "object",
    description: "string",
    company: "object",
    initialDate: "string",
    finalDate: "string",
  }),
  modify
);

// Destroy
router.delete("/:id", validationParamsId, destroy);

export default router;
