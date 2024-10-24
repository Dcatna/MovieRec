import { useScrollContext } from "@/App";
import Moviebox from "@/components/Moviebox";
import TMDBCClient from "@/Data/TMDB-fetch";
import { MovieListResult, ResourceType } from "@/types/MovieListResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState,useEffect, useMemo } from "react";
import genreData from "../Data/genres.json"
import { Badge } from "@/components/ui/Badge";

export interface Genre {
    id: number;
    name: string;
}


const BrowsePage = () => {

    const [genreIds, setGenreIds] = useState<number[]>([])
    const client = new TMDBCClient()
    const [searchState, setSearchState] = useState<ResourceType>("movie")
    const genres = genreData.genres as Genre[]

    const handleFilterButtons = (filter : number) => {
        setGenreIds((prevFilters : number[]) =>
            prevFilters.includes(filter)
                ? prevFilters.filter((it) => it != filter)
                : [...prevFilters, filter]
        )
    }

    

    const { data, fetchNextPage} = useInfiniteQuery({
        queryKey: ['trendingMovies', genreIds, searchState],
        queryFn: ({ pageParam = 1}) => client.fetchMovieList(pageParam, searchState, genreIds),
    
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) {
                return lastPage.page + 1;
            } else {
                return undefined;
            }
        },
    });

    const {ref} = useScrollContext()
  
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = ref.current!;
            //checking if we are near the bottom of the screen
            // Checking if the div has been scrolled to the bottom
            if (scrollHeight - scrollTop <= clientHeight + 1) {
                fetchNextPage().catch((e) => alert(e.toLocaleString()));
            }
        }

        ref.current?.addEventListener('scroll', handleScroll)
        return () => ref.current?.removeEventListener('scroll', handleScroll)

    }, [])

    

    const items = useMemo(() => {
        return data?.pages.flatMap((page) => page.results) ?? []

    }, [data, genreIds])

    
    return (
<body className='overflow-x-hidden '>
  <div className="flex flex-col items-center">
    <div className="my-4 w-full mx-auto">
      <div className='flex justify-center items-center space-x-4 py-2 cursor-pointer'>
        <div onClick={() => setSearchState("movie")} className='cursor-pointer hover:underline'>Movies</div>
        <div> | </div>
        <div onClick={() => setSearchState("tv")} className='cursor-pointer hover:underline'>Shows</div>
      </div>
      
      {/* Container for genres */}
      <div className="flex flex-wrap justify-center gap-2 w-full mx-auto mt-10">
        {genres.map(({ id, name }) => {
          const selected = genreIds.includes(id);
          return (
            <Badge
              key={id}
              className="hover:bg-primary rounded-md mb-2 px-2 py-1"
              onClick={() => handleFilterButtons(id)}
              variant={selected ? "default" : "outline"}
              id={id.toString()}
            >
              {name}
            </Badge>
          );
        })}
      </div>
    </div>        
  </div>

  {/* Movie Grid */}
  <div className="w-full px-4 md:px-0 py-5 flex justify-center">
    <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6 w-full max-w-6xl px-4">
      {items.map((movie: MovieListResult) => (
        <div key={movie.id} className="flex justify-center">
          <Moviebox movie_id={movie.id} title={movie.title} posterpath={movie.poster_path} item={movie}/>
        </div>
      ))}
    </div>
  </div>
</body>


    )
}

export default BrowsePage