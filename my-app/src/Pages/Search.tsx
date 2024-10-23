import { useScrollContext } from "@/App";
import Moviebox from "@/components/Moviebox";
import Showbox from "@/components/Showbox";
import { Skeleton } from "@/components/ui/skeleton";
import TMDBCClient from "@/Data/TMDB-fetch";
import { useUserStore } from "@/Data/userstore";
import { MovieListResult, ResourceType, ShowListResult } from "@/types/MovieListResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { shallow, useShallow } from "zustand/shallow";


type SearchResult = MovieListResult | ShowListResult;

const SearchPage = ({ type }: { type: ResourceType }) => {
  const [currSearch, setCurrSearch] = useState<string>("")
    const [searchState, setSearchState] = useState<ResourceType>("movie")
    const [searching, setSearching] = useState<boolean>(false)
    //const client = useUserStore(useShallow((state) => state.stored))
    const tmdbclient = new TMDBCClient()
    const [query, setQuery] = useState<string>('')

    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery({
      queryKey: ['search', currSearch, searchState],
      queryFn: async ({ pageParam = 1 }) => {
          if (currSearch !== "") {
              return searchState === "movie" 
                  ? tmdbclient?.fetchMovieSearchList(pageParam, searchState, currSearch) 
                  : tmdbclient?.fetchShowSearchList(pageParam, searchState, currSearch);
          } else {
              return tmdbclient?.fetchMovieList(pageParam, searchState, []);
          }
      },
      getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
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


  const items : SearchResult[] = useMemo(() => {
    console.log(currSearch)
    return data?.pages.flatMap((page) => page.results as SearchResult[]) ?? []

  }, [data, currSearch])


  useEffect(() => {
    setSearching(true)
    const delayInputTimeoutId = setTimeout(() => {
        setSearching(false);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [currSearch, 500]);

  return (
    <body className='overflow-x-hidden'>
    <div className="flex flex-col items-center">
    <div className="my-4 w-full max-w-md mx-auto">
    <div className='flex justify-center items-center space-x-4 py-2 cursor-pointer'>
          <div onClick={() => setSearchState("movie")} className=''>Movies</div>
          <div> | </div>
          <div onClick={() => setSearchState("tv")}>Shows</div>
      </div>
        <input
            type="text"
            onChange={(letter) => setCurrSearch(letter.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-black"
            placeholder={searchState=="movie" ? "Search movies..." : "Search shows..."}
        />
    </div>
        <ItemsGrid items={items} searching={searching} />
        
</div>
</body>
  );
};
type ItemProps  = {
  items : SearchResult[]
  searching: boolean
}

const ItemsGrid = ({items,searching}: ItemProps) => {
  if (searching) {
      return  (
          <div className="w-full px-4 md:px-0">
              <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 p-12">
                  {Array.from(Array(40).keys()).map((idx) => {
                      return (
                          <div className="flex flex-col space-y-3 p-6" key={idx}>
                              <Skeleton className="h-[300px] w-[220px] rounded-xl"/>
                          <div className="space-y-2">
                              <Skeleton className="h-3 w-9/12"/>
                          </div>
                      </div>
                      )
                  })}
              </div>
          </div>
      )
  } else {
      return (
          <div className="w-full px-4 md:px-0 p-12">
              <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 p-6">

              {items.map((item) => (
                      'original_title' in item ? (
                          <div key={item.id}>
                              <Moviebox movie_id={item.id} title={item.title} posterpath={item.poster_path} item={item}></Moviebox>
                          </div>
                      ) : (

                          <div key={item.id}>
                              <Showbox show_id={item.id} title={item.name} posterpath={item.poster_path} item={item}></Showbox>
                          </div>
                      )
                  ))}
              </div>
          </div>
      )
  }
}
export default SearchPage;
