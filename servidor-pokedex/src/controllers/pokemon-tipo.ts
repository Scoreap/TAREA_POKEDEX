import type { Request, Response } from "express";

export async function getPokemon(req: Request, res: Response) {
  // A · LEER EL PEDIDO — el :type de la ruta
  const { type } = req.params;

  // B · CONSEGUIR EL DATO — tu server se vuelve CLIENTE de otra API
  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${type}`);
  if (!r.ok) {
    return res.status(404).json({ error: "No lo encontré" });
  }
  const data = await r.json();

  // C · RESPONDER — reformo: solo lo que sirve, con nombres claros
  res.json({
    id: data.id,
    nombre: data.name,
    imagen: data.sprites.other["official-artwork"].front_default,
    tipos: data.types.map((t: any) => t.type.name),
  });

  
}