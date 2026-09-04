import type { Request, Response } from "express";
import type { PokeApiType, PokemonResumen, ResultadoPorTipo } from "../types.js";

// GET /api/pokemon/type/:type → lista de Pokémon del tipo indicado.
export async function getPokemonPorTipo(req: Request, res: Response) {
  const tipo = String(req.params.type ?? "").trim().toLowerCase();
  if (!tipo) {
    return res.status(400).json({ error: "El tipo de Pokémon es obligatorio." });
  }

  try {
    const r = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
    if (r.status === 404) {
      return res.status(404).json({ error: `Tipo no encontrado: ${tipo}` });
    }
    if (!r.ok) {
      return res.status(502).json({ error: "La API de Pokémon devolvió un error." });
    }

    const data = (await r.json()) as PokeApiType;
    const pokemons: PokemonResumen[] = data.pokemon.map(({ pokemon: entry }) => {
      const match = entry.url.match(/\/pokemon\/(\d+)\/?$/);
      return { id: match ? Number(match[1]) : 0, nombre: entry.name };
    });

    const resultado: ResultadoPorTipo = {
      tipo: data.name,
      cantidad: pokemons.length,
      pokemons,
    };

    return res.json(resultado);
  } catch (error) {
    return res.status(502).json({ error: "No se pudo conectar con la API de Pokémon." });
  }
}