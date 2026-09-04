// Vista Detalle — propiedad de Persona B.
import { getPokemonDetail } from "./api.js";

const detailContainer = document.getElementById("pokemon-detail");
const stateMessage = document.getElementById("state-message");

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function init() {
  const id = getIdFromQuery();
  if (!id) {
    stateMessage.textContent = "No se especificó un Pokémon.";
    stateMessage.classList.remove("hidden");
    stateMessage.classList.add("error");
    return;
  }

  try {
    const data = await getPokemonDetail(id);
    stateMessage.classList.add("hidden");
    // TODO (Persona B): renderizar sprites, stats, habilidades y cadena de evolución.
    console.log(data);
  } catch (error) {
    stateMessage.textContent = "No se pudo cargar el detalle del Pokémon.";
    stateMessage.classList.remove("hidden");
    stateMessage.classList.add("error");
  }
}

init();
