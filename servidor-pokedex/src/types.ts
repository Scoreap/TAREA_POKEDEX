// Contrato de la API propia: lo que consume el frontend.
export interface Pokemon {
  id: number;
  nombre: string;
  imagen: string;
  tipos: string[];
}

export interface PokemonResumen {
  id: number;
  nombre: string;
}

export interface ResultadoPorTipo {
  tipo: string;
  cantidad: number;
  pokemons: PokemonResumen[];
}

// Formas que devuelve PokeAPI v2 (solo lo que usamos).
export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
    versions?: {
      "generation-iii"?: {
        "firered-leafgreen"?: { front_default: string | null };
      };
    };
  };
  types: { type: { name: string } }[];
}

export interface PokeApiType {
  name: string;
  pokemon: { slot: number; pokemon: { name: string; url: string } }[];
}