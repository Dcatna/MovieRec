export interface Genre {
    id: number;
    name: string;
}

export interface favs {
  _id: number
  user_id : number
  poster_path: string
  title: string
  overview: string
  vote_average: number
  movie_id : number
  show_id : number
  created_at : string
}

export interface ShowDetailResponse {
  adult: boolean;
  backdrop_path: string;
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string;
  }>;
  episode_run_time: number[];
  first_air_date: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
  };
  name: string;
  next_episode_to_air: null;
  networks: Array<{
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}


export interface UserList {
  list_id: string
  user_id: string 
  name: string
  created_at: string 
  updated_at: string 
  public: boolean
  description: string
  subscribers: number
}
export interface PosterLists {
  createdAt: string
  description: string
  list_id: string
  name: string
  public: boolean
  updatedAt: string
  userId: string
  username: string
  profileImagePath: string | null
  ids: string[] | null
  total: number | null
}
export type Rating = {
    certification: string,
    meaning: string,
    order: number
}
export interface Credit {
    id: number
    cast: Cast[]
    crew: Crew[]
  }
  
export interface Cast {
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path?: string
    cast_id: number
    character: string
    credit_id: string
    order: number
  }
  
export interface Crew {
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path?: string
    credit_id: string
    department: string
    job: string
  }
  export interface SimilarMovieResult {
    page: number
    results: SimilarMovie[]
    total_pages: number
    total_results: number
  }
  
  export interface SimilarMovie {
    adult: boolean
    backdrop_path?: string
    genre_ids: number[]
    id: number
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path?: string
    release_date: string
    title: string
    video: boolean
    vote_average: number
    vote_count: number
  }


  export interface MovieDetails {
    adult: boolean
    backdrop_path: string
    belongs_to_collection: BelongsToCollection
    budget: number
    genres: Genre[]
    homepage: string
    id: number
    imdb_id: string
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    release_date: string
    revenue: number
    runtime: number
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string
    title: string
    video: boolean
    vote_average: number
    vote_count: number
  }
  
  export interface BelongsToCollection {
    id: number
    name: string
    poster_path: string
    backdrop_path: string
  }
  
  export interface Genre {
    id: number
    name: string
  }
  
  export interface ProductionCompany {
    id: number
    logo_path: string
    name: string
    origin_country: string
  }
  
  export interface ProductionCountry {
    iso_3166_1: string
    name: string
  }
  
  export interface SpokenLanguage {
    english_name: string
    iso_639_1: string
    name: string
  }


  export interface ShowDetails {
    adult: boolean
    backdrop_path: string
    created_by: CreatedByShow[]
    episode_run_time: any[]
    first_air_date: string
    genres: Genre[]
    homepage: string
    id: number
    in_production: boolean
    languages: string[]
    last_air_date: string
    last_episode_to_air: LastEpisodeToAirShow
    name: string
    next_episode_to_air: NextEpisodeToAirShow
    networks: NetworkShow[]
    number_of_episodes: number
    number_of_seasons: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: ProductionCompanyShow[]
    production_countries: ProductionCountryShow[]
    seasons: SeasonShow[]
    spoken_languages: SpokenLanguageShow[]
    status: string
    tagline: string
    type: string
    vote_average: number
    vote_count: number
  }
  
  export interface CreatedByShow {
    id: number
    credit_id: string
    name: string
    gender: number
    profile_path: any
  }
  
  export interface GenreShow {
    id: number
    name: string
  }
  
  export interface LastEpisodeToAirShow {
    id: number
    name: string
    overview: string
    vote_average: number
    vote_count: number
    air_date: string
    episode_number: number
    episode_type: string
    production_code: string
    runtime: any
    season_number: number
    show_id: number
    still_path: any
  }
  
  export interface NextEpisodeToAirShow {
    id: number
    name: string
    overview: string
    vote_average: number
    vote_count: number
    air_date: string
    episode_number: number
    episode_type: string
    production_code: string
    runtime: any
    season_number: number
    show_id: number
    still_path: any
  }
  
  export interface NetworkShow {
    id: number
    logo_path: string
    name: string
    origin_country: string
  }
  
  export interface ProductionCompanyShow {
    id: number
    logo_path: string
    name: string
    origin_country: string
  }
  
  export interface ProductionCountryShow {
    iso_3166_1: string
    name: string
  }
  
  export interface SeasonShow {
    air_date: string
    episode_count: number
    id: number
    name: string
    overview: string
    poster_path?: string
    season_number: number
    vote_average: number
  }
  
  export interface SpokenLanguageShow {
    english_name: string
    iso_639_1: string
    name: string
  }
  