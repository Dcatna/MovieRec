import Moviebox from "@/components/Moviebox";
import Showbox from "@/components/Showbox";
import { Skeleton } from "@/components/ui/skeleton";
import TMDBCClient from "@/Data/TMDB-fetch";
import { MovieListResult, ResourceType, ShowListResult } from "@/types/MovieListResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";


type SearchResult = MovieListResult | ShowListResult;

const SearchPage = () => {
  const [currSearch, setCurrSearch] = useState<string>("")
    const [searchState, setSearchState] = useState<ResourceType>("movie")
    const [searching, setSearching] = useState<boolean>(false)
    //const client = useUserStore(useShallow((state) => state.stored))
    const tmdbclient = new TMDBCClient()

    const { data, fetchNextPage, hasNextPage  } = useInfiniteQuery({
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
      
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      // Check if we're close to the bottom of the page
      if (scrollHeight - scrollTop <= clientHeight + 100 && hasNextPage) {
        fetchNextPage().catch((e) => alert(e.toLocaleString()));
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [searchState, fetchNextPage, hasNextPage]);


  const items : SearchResult[] = useMemo(() => {
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
                              <Moviebox movie_id={item.id} title={item.title} posterpath={item.poster_path} item={item} inList={false} list_id={undefined}></Moviebox>
                          </div>
                      ) : (

                          <div key={item.id}>
                              <Showbox show_id={item.id} title={item.name} posterpath={item.poster_path} item={item} inList={false} list_id={undefined}></Showbox>
                          </div>
                      )
                  ))}
              </div>
          </div>
      )
  }
}
export default SearchPage;
