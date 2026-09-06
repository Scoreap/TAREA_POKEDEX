// Vista Detalle — propiedad de Persona B.

import {
  getPokemonDetail,
  getPokemonSpecies,
  getEvolutionChain,
} from "./api.js";

const detailContainer = document.getElementById("pokemon-detail");
const stateMessage = document.getElementById("state-message");

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatName(text) {
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function renderTypes(types) {
  return types
    .map(
      (item) => `
        <span class="type-badge">
          ${formatName(item.type.name)}
        </span>
      `
    )
    .join("");
}

function renderAbilities(abilities) {
  return abilities
    .map(
      (item) => `
        <li>
          ${formatName(item.ability.name)}
          ${item.is_hidden ? "<span> (Oculta)</span>" : ""}
        </li>
      `
    )
    .join("");
}

function renderStats(stats) {
  const statNames = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Ataque especial",
    "special-defense": "Defensa especial",
    speed: "Velocidad",
  };

  return stats
    .map(
      (item) => `
        <div class="stat-card">
          <span>${statNames[item.stat.name] || formatName(item.stat.name)}</span>
          <strong>${item.base_stat}</strong>

          <div class="stat-bar">
            <div
              class="stat-bar__fill"
              style="width: ${Math.min(item.base_stat, 100)}%"
            ></div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderSprites(data) {
  const sprites = [
    {
      image: data.sprites.front_default,
      text: "Frente",
    },
    {
      image: data.sprites.back_default,
      text: "Espalda",
    },
    {
      image: data.sprites.front_shiny,
      text: "Shiny",
    },
    {
      image: data.sprites.back_shiny,
      text: "Shiny espalda",
    },
  ];

  return sprites
    .filter((sprite) => sprite.image)
    .map(
      (sprite) => `
        <div class="sprite-card">
          <img
            src="${sprite.image}"
            alt="${sprite.text} de ${data.name}"
          />
          <span>${sprite.text}</span>
        </div>
      `
    )
    .join("");
}

function collectEvolutionNames(node, names = []) {
  names.push(node.species.name);

  node.evolves_to.forEach((evolution) => {
    collectEvolutionNames(evolution, names);
  });

  return names;
}

function renderEvolutionNode(node, pokemonMap) {
  const pokemon = pokemonMap.get(node.species.name);

  let html = `
    <div class="evolution-stage">
      <a href="detalle.html?id=${pokemon.id}" class="evolution-card">
        <img
          src="${pokemon.sprites.front_default}"
          alt="${pokemon.name}"
        />

        <span>#${String(pokemon.id).padStart(3, "0")}</span>
        <strong>${formatName(pokemon.name)}</strong>
      </a>
  `;

  if (node.evolves_to.length > 0) {
    html += `
      <div class="evolution-arrow">↓</div>
      <div class="evolution-next">
    `;

    node.evolves_to.forEach((nextEvolution) => {
      html += renderEvolutionNode(nextEvolution, pokemonMap);
    });

    html += "</div>";
  }

  html += "</div>";

  return html;
}

async function renderEvolutionChain(chain) {
  const names = collectEvolutionNames(chain);

  const pokemonDetails = await Promise.all(
    [...new Set(names)].map((name) => getPokemonDetail(name))
  );

  const pokemonMap = new Map(
    pokemonDetails.map((pokemon) => [pokemon.name, pokemon])
  );

  return renderEvolutionNode(chain, pokemonMap);
}

async function renderPokemon(data, evolutionChain) {
  const number = String(data.id).padStart(3, "0");

  const mainSprite =
    data.sprites.other?.["official-artwork"]?.front_default ||
    data.sprites.front_default;

  const evolutionHTML = await renderEvolutionChain(evolutionChain.chain);

  detailContainer.innerHTML = `
    <div class="pokemon-detail__header">
      <div class="pokemon-detail__main-image">
        <img
          src="${mainSprite}"
          alt="Imagen de ${data.name}"
        />
      </div>

      <div class="pokemon-detail__info">
        <span class="pokemon-detail__number">#${number}</span>

        <h1>${formatName(data.name)}</h1>

        <div class="pokemon-detail__types">
          ${renderTypes(data.types)}
        </div>

        <p>
          <strong>Altura:</strong>
          ${(data.height / 10).toFixed(1)} m
        </p>

        <p>
          <strong>Peso:</strong>
          ${(data.weight / 10).toFixed(1)} kg
        </p>
      </div>
    </div>

    <section class="pokemon-detail__section">
      <h2>Habilidades</h2>

      <ul class="pokemon-detail__abilities">
        ${renderAbilities(data.abilities)}
      </ul>
    </section>

    <section class="pokemon-detail__section">
      <h2>Sprites</h2>

      <div class="pokemon-detail__sprites">
        ${renderSprites(data)}
      </div>
    </section>

    <section class="pokemon-detail__section">
      <h2>Estadísticas base</h2>

      <div class="pokemon-detail__stats">
        ${renderStats(data.stats)}
      </div>
    </section>

    <section class="pokemon-detail__section">
      <h2>Cadena de evolución</h2>

      <div class="evolution-chain">
        ${evolutionHTML}
      </div>
    </section>
  `;
}

async function init() {
  const id = getIdFromQuery();

  if (!id) {
    stateMessage.textContent = "No se especificó un Pokémon.";
    stateMessage.classList.remove("hidden");
    stateMessage.classList.add("error");
    return;
  }

  stateMessage.textContent = "Cargando Pokémon...";
  stateMessage.classList.remove("hidden");
  stateMessage.classList.remove("error");

  try {
    // Datos principales
    const data = await getPokemonDetail(id);

    // Información de la especie
    const species = await getPokemonSpecies(data.name);

    // Cadena de evolución
    const evolutionChain = await getEvolutionChain(
      species.evolution_chain.url
    );

    await renderPokemon(data, evolutionChain);

    stateMessage.classList.add("hidden");
  } catch (error) {
    console.error(error);

    stateMessage.textContent =
      "No se pudo cargar el detalle del Pokémon.";

    stateMessage.classList.remove("hidden");
    stateMessage.classList.add("error");
  }
}

init();