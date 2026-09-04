// Vista Listado — propiedad de Persona A.
import { getPokemonList } from "./api.js";

const grid = document.getElementById("pokemon-grid");
const stateMessage = document.getElementById("state-message");

async function init() {
  try {
    const data = await getPokemonList();
    stateMessage.classList.add("hidden");
    // TODO (Persona A): renderizar tarjetas en `grid`, buscador, filtro por tipo y paginación.
    console.log(data);
  } catch (error) {
    stateMessage.textContent = "No se pudo cargar la lista de Pokémon.";
    stateMessage.classList.remove("hidden");
    stateMessage.classList.add("error");
  }
}

init();
