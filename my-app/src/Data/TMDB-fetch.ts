import { MovieListResponse } from "../Types/TMDB-types";

export async function FetchPopularMovies(
    page: number,
    type: string,
    with_genres: number[],
    language: string | undefined = 'en-US',
    sort_by: string | undefined,
    include_adult: boolean | undefined = true,
    include_video: boolean | undefined = false
) : Promise<MovieListResponse> {

    const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`
    
    const res = await fetch(url, {headers: {'Authorization': `Bearer ${import.meta.env.VITE_APP_TBDB_ACCESS_TOKEN}`}})
    console.log(res)
    if (!res.ok) {
        throw new Error("Not OKa!")
    }

    return await res.json() as MovieListResponse
}




