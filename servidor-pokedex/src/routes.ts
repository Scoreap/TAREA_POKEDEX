import { Router } from "express";
import { getPokemon } from "./controllers/pokemon";

export const router = Router();

// método + dirección → controlador. La ruta NO resuelve nada.
router.get("/pokemon/:nombre", getPokemon);

router.get("/pokemon/:type", getPokemon);
