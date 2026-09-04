// Vista Listado — propiedad de Persona A.
import { getPokemonList, getPokemonDetail, getType, getGeneration } from "./api.js";

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

const GENERATIONS = [
  { name: "generation-i", label: "Kanto (I)" },
  { name: "generation-ii", label: "Johto (II)" },
  { name: "generation-iii", label: "Hoenn (III)" },
  { name: "generation-iv", label: "Sinnoh (IV)" },
  { name: "generation-v", label: "Teselia (V)" },
  { name: "generation-vi", label: "Kalos (VI)" },
  { name: "generation-vii", label: "Alola (VII)" },
  { name: "generation-viii", label: "Galar (VIII)" },
  { name: "generation-ix", label: "Paldea (IX)" },
];

const grid = document.getElementById("pokemon-grid");
const stateMessage = document.getElementById("state-message");
const searchInput = document.getElementById("search-input");
const generationFilter = document.getElementById("generation-filter");
const type1Filter = document.getElementById("type1-filter");
const type2Filter = document.getElementById("type2-filter");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");

const state = {
  entries: [], // nombres que cumplen generación + tipo 1 + tipo 2
  filtered: [], // tras aplicar el buscador
  page: 0,
};

function showMessage(text, isError = false) {
  stateMessage.textContent = text;
  stateMessage.classList.toggle("hidden", !text);
  stateMessage.classList.toggle("error", isError);
}

function populateSelect(select, entries, placeholder) {
  const placeholderOption = select.querySelector('option[value=""]') ?? select.options[0];
  select.innerHTML = "";
  select.appendChild(placeholderOption);
  for (const { value, label } of entries) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

function renderCard(pokemon) {
  const sprite =
    pokemon.sprites?.versions?.["generation-iii"]?.["firered-leafgreen"]?.front_default ||
    pokemon.sprites?.front_default ||
    "";
  const number = String(pokemon.id).padStart(3, "0");
  const types = pokemon.types
    .map((t) => {
      const color = TYPE_COLORS[t.type.name] ?? "#777";
      return `<span class="type-badge" style="background-color:${color}">${t.type.name}</span>`;
    })
    .join("");

  return `
    <li>
      <a class="pokemon-card" href="detalle.html?id=${pokemon.id}">
        <span class="pokemon-card__number">#${number}</span>
        <img class="pokemon-card__sprite" src="${sprite}" alt="${pokemon.name}" loading="lazy" />
        <span class="pokemon-card__name">${pokemon.name}</span>
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
    showMessage("No se encontraron Pokémon con esos filtros.");
    return;
  }

  showMessage("Cargando...");
  try {
    const details = await Promise.all(pageNames.map((name) => getPokemonDetail(name)));
    showMessage("");
    grid.innerHTML = details.map(renderCard).join("");
  } catch (error) {
    showMessage("No se pudo cargar la lista de Pokémon.", true);
  }
}

function applySearch() {
  const term = searchInput.value.trim().toLowerCase();
  state.filtered = term ? state.entries.filter((name) => name.includes(term)) : state.entries;
  state.page = 0;
  renderPage();
}

/** Nombres de Pokémon que cumplen la generación y los tipos elegidos (slot 1 / slot 2). */
async function loadEntries() {
  let names;

  if (generationFilter.value) {
    const data = await getGeneration(generationFilter.value);
    names = data.pokemon_species.map((species) => species.name);
  } else {
    const data = await getPokemonList(100000, 0);
    names = data.results.map((entry) => entry.name);
  }

  if (type1Filter.value) {
    const data = await getType(type1Filter.value);
    const primaryNames = new Set(
      data.pokemon.filter((entry) => entry.slot === 1).map((entry) => entry.pokemon.name)
    );
    names = names.filter((name) => primaryNames.has(name));
  }

  if (type2Filter.value) {
    const data = await getType(type2Filter.value);
    const secondaryNames = new Set(
      data.pokemon.filter((entry) => entry.slot === 2).map((entry) => entry.pokemon.name)
    );
    names = names.filter((name) => secondaryNames.has(name));
  }

  return names;
}

async function onFiltersChange() {
  showMessage("Cargando...");
  try {
    state.entries = await loadEntries();
    applySearch();
  } catch (error) {
    showMessage("No se pudo aplicar el filtro seleccionado.", true);
  }
}

let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(applySearch, 250);
});

generationFilter.addEventListener("change", onFiltersChange);
type1Filter.addEventListener("change", onFiltersChange);
type2Filter.addEventListener("change", onFiltersChange);

prevBtn.addEventListener("click", () => {
  state.page -= 1;
  renderPage();
});

nextBtn.addEventListener("click", () => {
  state.page += 1;
  renderPage();
});

async function init() {
  populateSelect(
    generationFilter,
    GENERATIONS.map((gen) => ({ value: gen.name, label: gen.label })),
    "Todas las generaciones"
  );
  const typeOptions = Object.keys(TYPE_COLORS).map((type) => ({ value: type, label: type }));
  populateSelect(type1Filter, typeOptions, "Tipo 1: cualquiera");
  populateSelect(type2Filter, typeOptions, "Tipo 2: cualquiera");

  await onFiltersChange();
}

init();
