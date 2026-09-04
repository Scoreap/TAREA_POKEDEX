// Vista Listado — con búsqueda por nombre y por tipo contra el backend propio.
import { getPokemonList } from "./api.js";
import {
  buscarPokemonPorNombre,
  buscarPokemonPorTipo,
  obtenerDetallePokemon,
} from "./pokemonService.js";

const PAGE_SIZE = 20;

const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

const grid = document.getElementById("pokemon-grid");
const stateMessage = document.getElementById("state-message");
const searchInput = document.getElementById("search-input");
const searchMode = document.getElementById("search-mode");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");

const state = {
  entries: [], // nombres que se muestran (todo el Pokédex o resultado de búsqueda por tipo)
  filtered: [],
  page: 0,
  buscarPor: "nombre",
};

// Contador para descartar respuestas viejas: evita que un resultado anterior
// se quede pintado cuando el modo o el término cambian.
let searchId = 0;

function showMessage(text, isError = false) {
  stateMessage.textContent = text;
  stateMessage.classList.toggle("hidden", !text);
  stateMessage.classList.toggle("error", isError);
}

function renderCard(pokemon) {
  const number = String(pokemon.id).padStart(3, "0");
  const types = (pokemon.tipos ?? [])
    .map((t) => {
      const color = TYPE_COLORS[t] ?? "#777";
      return `<span class="type-badge" style="background-color:${color}">${t}</span>`;
    })
    .join("");

  return `
    <li>
      <a class="pokemon-card" href="detalle.html?id=${pokemon.id}">
        <span class="pokemon-card__number">#${number}</span>
        <img class="pokemon-card__sprite" src="${pokemon.imagen}" alt="${pokemon.nombre}" loading="lazy" />
        <span class="pokemon-card__name">${pokemon.nombre}</span>
        <span class="pokemon-card__types">${types}</span>
      </a>
    </li>
  `;
}

async function renderPage() {
  const start = state.page * PAGE_SIZE;
  const pageNames = state.filtered.slice(start, start + PAGE_SIZE);

  prevBtn.disabled = state.page === 0;
  nextBtn.disabled = start + PAGE_SIZE >= state.filtered.length;

  if (pageNames.length === 0) {
    grid.innerHTML = "";
    showMessage("No se encontraron Pokémon.");
    return;
  }

  showMessage("Cargando...");
  const current = searchId;
  try {
    const details = await Promise.all(pageNames.map((nombre) => obtenerDetallePokemon(nombre)));
    if (current !== searchId) return;
    showMessage("");
    grid.innerHTML = details.map(renderCard).join("");
  } catch (error) {
    if (current !== searchId) return;
    showMessage("No se pudo cargar la lista de Pokémon.", true);
  }
}

/** Pinta resultados ya resueltos (búsqueda por nombre) usando las tarjetas actuales. */
function renderResults(lista) {
  state.entries = lista.map((p) => p.nombre);
  state.filtered = lista.map((p) => p.nombre);
  state.page = 0;

  if (lista.length === 0) {
    grid.innerHTML = "";
    showMessage("No se encontraron Pokémon.");
    return;
  }

  showMessage("");
  grid.innerHTML = lista.map(renderCard).join("");
  prevBtn.disabled = true;
  nextBtn.disabled = true;
}

function buscarPorNombre(term) {
  const current = ++searchId;
  showMessage("Cargando...");
  grid.innerHTML = "";

  buscarPokemonPorNombre(term)
    .then((pokemon) => {
      if (current !== searchId) return;
      renderResults([pokemon]);
    })
    .catch((error) => {
      if (current !== searchId) return;
      if (error.status === 404) {
        grid.innerHTML = "";
        showMessage(`No se encontró el Pokémon "${term}".`);
      } else {
        showMessage(`Error al buscar "${term}".`, true);
      }
    });
}

function buscarPorTipo(term) {
  const current = ++searchId;
  showMessage("Cargando...");
  grid.innerHTML = "";

  buscarPokemonPorTipo(term)
    .then((resultado) => {
      if (current !== searchId) return;
      const nombres = resultado.pokemons.map((p) => p.nombre);
      if (nombres.length === 0) {
        grid.innerHTML = "";
        showMessage(`No hay Pokémon del tipo "${term}".`);
        return;
      }
      state.entries = nombres;
      state.filtered = nombres;
      state.page = 0;
      renderPage();
    })
    .catch((error) => {
      if (current !== searchId) return;
      if (error.status === 404) {
        grid.innerHTML = "";
        showMessage(`No existe el tipo "${term}".`);
      } else {
        showMessage(`Error al buscar el tipo "${term}".`, true);
      }
    });
}

function runSearch() {
  const term = searchInput.value.trim();
  if (!term) {
    cargarTodos(); // vacío → todo el Pokédex
    return;
  }
  if (state.buscarPor === "tipo") {
    buscarPorTipo(term);
  } else {
    buscarPorNombre(term);
  }
}

/** Carga todos los nombres de Pokémon para navegar la lista completa. */
async function cargarTodos() {
  const current = ++searchId;
  showMessage("Cargando...");
  try {
    const data = await getPokemonList(100000, 0);
    if (current !== searchId) return;
    state.entries = data.results.map((entry) => entry.name);
    state.filtered = state.entries;
    state.page = 0;
    renderPage();
  } catch (error) {
    if (current !== searchId) return;
    showMessage("No se pudo cargar la lista de Pokémon.", true);
  }
}

let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(runSearch, 250);
});

searchMode.addEventListener("change", () => {
  state.buscarPor = searchMode.value;
  runSearch();
});

prevBtn.addEventListener("click", () => {
  state.page -= 1;
  renderPage();
});

nextBtn.addEventListener("click", () => {
  state.page += 1;
  renderPage();
});

async function init() {
  state.buscarPor = searchMode.value;
  await cargarTodos();
}

init();