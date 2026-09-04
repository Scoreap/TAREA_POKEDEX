// Wrapper compartido para consumir PokeAPI v2. No modificar sin avisar al equipo.

const BASE_URL = "https://pokeapi.co/api/v2";

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar ${url}`);
  }
  return response.json();
}

export function getPokemonList(limit = 20, offset = 0) {
  return fetchJSON(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
}

export function getPokemonDetail(idOrName) {
  return fetchJSON(`${BASE_URL}/pokemon/${idOrName}`);
}

export function getPokemonSpecies(idOrName) {
  return fetchJSON(`${BASE_URL}/pokemon-species/${idOrName}`);
}

export function getEvolutionChain(url) {
  return fetchJSON(url);
}

export function getType(idOrName) {
  return fetchJSON(`${BASE_URL}/type/${idOrName}`);
}
