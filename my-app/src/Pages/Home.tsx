import React, { useEffect } from 'react'
import { useState } from 'react'
import {FetchPopularMovies} from '../Data/TMDB-fetch.ts'
import { MovieListResponse, MovieListResult } from '../Types/TMDB-types'


const Home = () => {
    const [movies, setmovies] = useState<MovieListResult[]>([])
    useEffect(() => {
        async function fetchFunction() {
            const res = await FetchPopularMovies(1, 'movie', [], undefined, undefined)
            console.log([res as MovieListResponse])
            setmovies(res.results as MovieListResult[])
            console.log("HIII", movies)

        }
        fetchFunction()
    }, [])

  return (
    <div>
        hi
    </div>
  )
}

export default Home