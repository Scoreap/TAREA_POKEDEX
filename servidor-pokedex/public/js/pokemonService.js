// Capa única frontend → backend. Todas las llamadas HTTP de la Pokédex pasan por aquí,
// así ningún componente repite fetch. Errores HTTP lanzan Error con `error.status`.

const BASE_URL = "/api";

async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error ?? `Error ${response.status} al consultar ${url}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// GET /api/pokemon/:nombre → { id, nombre, imagen, tipos[] }
export function buscarPokemonPorNombre(nombre) {
  return fetchJSON(`${BASE_URL}/pokemon/${encodeURIComponent(nombre.trim().toLowerCase())}`);
}

// GET /api/pokemon/type/:type → { tipo, cantidad, pokemons: [{ id, nombre }] }
export function buscarPokemonPorTipo(tipo) {
  return fetchJSON(`${BASE_URL}/pokemon/type/${encodeURIComponent(tipo.trim().toLowerCase())}`);
}

// Detalle por nombre: lo usa la cuadrícula para pintar cada tarjeta.
export const obtenerDetallePokemon = buscarPokemonPorNombre;