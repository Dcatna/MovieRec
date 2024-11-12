import { TokenBucket } from "@/ratelimit/TokenBucket";
import { TokenBuckets } from "@/ratelimit/TokenBuckets";
import { MovieListResponse, MovieListResult, MovieTrailer, ResourceType, ShowListResponse, ShowListResult, SortType } from "@/types/MovieListResponse";
import { buildUrl } from "./query";
import { Credit, ShowDetailResponse, SimilarMovieResult } from "@/types/types";
import { ContentItem } from "./userstore";


export const showListResultToContentItem = (result: ShowListResult): ContentItem => {
    const partial_url = "https://image.tmdb.org/t/p/original/"
    return {
      id: result.id,
      isMovie: true,
      name: result.original_name,
      description: result.overview,
      posterUrl: partial_url+result.backdrop_path,
      favorite: false
    }
  }
  
  export const movieListResultToContentItem = (result: MovieListResult): ContentItem => {
      const partial_url = "https://image.tmdb.org/t/p/original/"
      return {
        id: result.id,
        isMovie: true,
        name: result.title,
        description: result.overview,
        posterUrl: partial_url+result.backdrop_path,
        favorite: false
      }
  }
  
export const movieResposneToContentItems = (res: MovieListResponse) => res.results.map(movieListResultToContentItem)
export const showResponseToContentItems = (res: ShowListResponse) => res.results.map(showListResultToContentItem)

class TMDBClient {

    private reqPerMin = 50

    private readonly apiKey: string = import.meta.env.VITE_TMDB_API_KEY
    private bucket: TokenBucket = TokenBuckets
        .builder()
        .withCapacity(this.reqPerMin)
        .withFixedIntervalRefillStrategy(
             this.reqPerMin,
            // 60 sec to milliseconds
            60 * 1000
        )
    .build()

    // Create an AbortController instance
    private controller = new AbortController();

    private readonly apiKeyParam = {
        name: "api_key",
        value: this.apiKey
    }

    private readonly BASE_URL = "https://api.themoviedb.org/3"

    async fetchMovieList(
        page: number,
        type: ResourceType,
        with_genres : number[],
        // region: string | undefined = undefined,
        language: string | undefined = "en-US",
        sort_by : SortType = undefined,
        include_adult : boolean | undefined = true,
        include_video : boolean | undefined = false
    ): Promise<MovieListResponse> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/discover/${type}`,
            [
                this.apiKeyParam,
                { name: "page", value: page },
                { name: "language", value: language },
                { name: "sort_by", value: sort_by},
                { name: "include_adult", value: include_adult},
                { name: "include_video", value: include_video},
            ],
            [
                { name: "with_genres", value: with_genres, join: "AND"},
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as MovieListResponse
    }
       
    //`https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${apiKey}`
    async fetchCreditList(
        movie_id: number,
        //type: ResourceType,
        language: string | undefined = "en-US",
    ): Promise<Credit> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/movie/${movie_id}}/credits`,
            [
                this.apiKeyParam,
                { name: "language", value: language },

            ],
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as Credit
    }
    async fetchShowCreditList(
        show_id: number,
        //type: ResourceType,
        language: string | undefined = "en-US",
    ): Promise<Credit> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/tv/${show_id}}/credits`,
            [
                this.apiKeyParam,
                { name: "language", value: language },

            ],
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as Credit
    }
    async fetchRecommendedMovieList(
        movie_id : number,
        page: number,

    ): Promise<MovieListResponse> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/movie/${movie_id}/recommendations`,
            [
                this.apiKeyParam,
                { name: "page", value: page },
                
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as MovieListResponse
    }
    async fetchRecommendedShowList(
        show_id : number,
        page: number,

    ): Promise<ShowListResponse> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/tv/${show_id}/recommendations`,
            [
                this.apiKeyParam,
                { name: "page", value: page },
                
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as ShowListResponse
    }

    async fetchShowList(
        page: number,
        type: ResourceType,
        with_genres : number[],
        // region: string | undefined = undefined,
        language: string | undefined = "en-US",
        sort_by : SortType = undefined,
        include_adult : boolean | undefined = true,
        include_video : boolean | undefined = false
    ): Promise<ShowListResponse> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/discover/${type}`,
            [
                this.apiKeyParam,
                { name: "page", value: page },
                { name: "language", value: language },
                { name: "sort_by", value: sort_by},
                { name: "include_adult", value: include_adult},
                { name: "include_video", value: include_video},
            ],
            [
                { name: "with_genres", value: with_genres, join: "OR"},
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as ShowListResponse
    }

    async fetchMovieSearchList(
        page: number,
        type: ResourceType,
        query: string | undefined = "",
        language: string | undefined = "en-US"
        
    ): Promise<MovieListResponse> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/search/${type}`,
            [
                this.apiKeyParam,
                { name: "page", value: page },
                { name: "language", value: language },
                { name: "query", value: query}
            ],
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as MovieListResponse
    }
    async fetchShowSearchList(
        page: number,
        type: ResourceType,
        query: string | undefined = "",
        language: string | undefined = "en-US"
        
    ): Promise<ShowListResponse> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/search/${type}`,
            [
                this.apiKeyParam,
                { name: "page", value: page },
                { name: "language", value: language },
                { name: "query", value: query}
            ],
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        return await res.json() as ShowListResponse
    }

    //url for trailers = 'https://api.themoviedb.org/3/movie/movie_id/videos?language=en-US'
    //https://api.themoviedb.org/3/movie/videos?api_key=11e1be5dc8a3cf947ce265da83199bce&movie_id=866398&language=en-US
    async fetchMovieTrailer(
        move_id : number,
        type : string | undefined = "videos",
        language : string | undefined = "en-US"

    ): Promise<MovieTrailer> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/movie/${move_id}/${type}`,
            [
                this.apiKeyParam,
                { name: "language", value: language },
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await res.json() as MovieTrailer
    }
    async fetchShowTrailer(
        show_id : number,
        type : string | undefined = "videos",
        language : string | undefined = "en-US"

    ): Promise<MovieTrailer> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/tv/${show_id}/${type}`,
            [
                this.apiKeyParam,
                { name: "language", value: language },
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await res.json() as MovieTrailer
    }
    async fetchSimilarMovie(
        move_id : number,
        type : string | undefined = "similar",
        language : string | undefined = "en-US"

    ): Promise<SimilarMovieResult> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/movie/${move_id}/${type}`,
            [
                this.apiKeyParam,
                { name: "language", value: language },
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await res.json() as SimilarMovieResult
    }
    async fetchSimilarShow(
        show_id : number,
        type : string | undefined = "similar",
        language : string | undefined = "en-US"

    ): Promise<SimilarMovieResult> {

        // Obtain a reference to the AbortSignal
        const signal = this.controller.signal;

        const url = buildUrl(
            `${this.BASE_URL}/tv/${show_id}/${type}`,
            [
                this.apiKeyParam,
                { name: "language", value: language },
            ]
        )
        const res = await this.fetchWithTimeout(url, signal);
        console.log(url)
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await res.json() as SimilarMovieResult
    }
    cancelOngoingRequests() {
        this.controller.abort();
        this.controller = new AbortController()
    }
    async fetchMovieByID(
        movie_id : number,
    ) : Promise<MovieListResult>{
        const signal = this.controller.signal

        const url = buildUrl(`${this.BASE_URL}/movie/${movie_id}`, [this.apiKeyParam])
        const res = await this.fetchWithTimeout(url, signal);
        if (!res.ok) {
            throw new Error("Network response as not ok")
        }
        return await res.json() as MovieListResult
    }
    async fetchShowByID(
        show_id : number,
    ) : Promise<ShowDetailResponse>{
        const signal = this.controller.signal

        const url = buildUrl(`${this.BASE_URL}/tv/${show_id}`, [this.apiKeyParam])
        const res = await this.fetchWithTimeout(url, signal);
        if (!res.ok) {
            throw new Error("Network response as not ok")
        }
        return await res.json() as ShowDetailResponse
    }

    fetchWithTimeout = async (url: string, signal: AbortSignal) => {

        if (signal.aborted) {
            return Promise.reject(signal.reason)
        }

        await this.bucket.consume()

        if (signal.aborted) {
            return Promise.reject(signal.reason)
        }

        return fetch(url, { signal })
    }
}

export const tmdbClient = new TMDBClient();