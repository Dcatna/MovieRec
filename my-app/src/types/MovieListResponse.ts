export interface MovieListResponse {
    page: number
    results: MovieListResult[]
    total_pages: number
    total_results: number
}

export interface MovieListResult {
    adult: boolean
    backdrop_path: string
    id: number
    title: string
    original_language: string
    original_title: string
    overview: string
    poster_path: string
    media_type: string
    genre_ids: number[]
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
}

export interface MovieTrailer {
    id: number
    results: MovieTrailerResult[]
  }
export interface ShowListResponse {
  page: number
  results: ShowListResult[]
  total_pages: number
  total_results: number
}

export interface ShowListResult {
  adult: boolean
  backdrop_path?: string
  genre_ids: number[]
  id: number
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string
  first_air_date: string
  name: string
  vote_average: number
  vote_count: number
}

  export interface MovieTrailerResult {
    iso_639_1: string
    iso_3166_1: string
    name: string
    key: string
    site: string
    size: number
    type: string
    official: boolean
    published_at: string
    id: string
  }

export type MovieListType = "popular" | "top_rated" | "upcoming" | "now_playing" | "discover"
export type ShowListType = "on_the_air" | "popular" | "top_rated" | "airing_today"
export type ResourceType =  "movie" | "tv"
export type SortType =
    "popularity.desc"
    | "popularity.asc"
    | "original_title.desc"
    | "original_title.asc"
    | "revenue.desc"
    | "revenue.asc"
    | "title.desc"
    | "title.asc"
    | undefined

