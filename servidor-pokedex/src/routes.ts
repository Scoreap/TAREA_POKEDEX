import { Router } from "express";
import { getPokemonPorNombre } from "./controllers/pokemon";
import { getPokemonPorTipo } from "./controllers/pokemon-tipo";

export const router = Router();

// GET /api/pokemon/:nombre → detalle de un Pokémon (búsqueda por nombre).
router.get("/pokemon/:nombre", getPokemonPorNombre);

// GET /api/pokemon/type/:type → lista de Pokémon del tipo (búsqueda por tipo).
router.get("/pokemon/type/:type", getPokemonPorTipo);