import type { Request, Response } from "express";
import type { PokeApiPokemon, Pokemon } from "../types.js";

// GET /api/pokemon/:nombre → detalle de un Pokémon.
export async function getPokemonPorNombre(req: Request, res: Response) {
  const nombre = String(req.params.nombre ?? "").trim().toLowerCase();
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del Pokémon es obligatorio." });
  }

  try {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    if (r.status === 404) {
      return res.status(404).json({ error: `Pokémon no encontrado: ${nombre}` });
    }
    if (!r.ok) {
      return res.status(502).json({ error: "La API de Pokémon devolvió un error." });
    }

    const data = (await r.json()) as PokeApiPokemon;
    const pokemon: Pokemon = {
      id: data.id,
      nombre: data.name,
      // Se conserva el sprite retro (FuegoRojo/HojaVerde) que usaba la tarjeta actual.
      imagen:
        data.sprites.versions?.["generation-iii"]?.["firered-leafgreen"]?.front_default ??
        data.sprites.front_default ??
        data.sprites.other?.["official-artwork"]?.front_default ??
        "",
      tipos: data.types.map((t) => t.type.name),
    };

    return res.json(pokemon);
  } catch (error) {
    return res.status(502).json({ error: "No se pudo conectar con la API de Pokémon." });
  }
}