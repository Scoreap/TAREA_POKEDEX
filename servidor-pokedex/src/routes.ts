import express from "express";

export const router = express.Router();

router.get("/pokemon", (req, res) => {
  res.json({ ok: true, message: "API de pokédex funcionando" });
});
