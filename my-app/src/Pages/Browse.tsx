import Moviebox from "@/components/Moviebox";
import TMDBCClient from "@/Data/TMDB-fetch";
import { MovieListResult, ShowListResult, ResourceType } from "@/types/MovieListResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import genreData from "../Data/genres.json";
import { Badge } from "@/components/ui/Badge";
import Showbox from "@/components/Showbox";
import { useScrollContext } from "@/ScrollContext";

export interface Genre {
  id: number;
  name: string;
}

const BrowsePage = () => {
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const client = new TMDBCClient();
  const [searchState, setSearchState] = useState<ResourceType>("movie");
  const genres = genreData.genres as Genre[];
  const { ref } = useScrollContext();

  const handleFilterButtons = (filter: number) => {
    setGenreIds((prevFilters: number[]) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((it) => it !== filter)
        : [...prevFilters, filter]
    );
  };

  // Infinite Query for Movies
  const {
    data: movieData,
    fetchNextPage: fetchNextMoviePage,
    hasNextPage: hasNextMoviePage,
  } = useInfiniteQuery({
    queryKey: ["trendingMovies", genreIds],
    queryFn: ({ pageParam = 1 }) => client.fetchMovieList(pageParam, "movie", genreIds),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: searchState === "movie", // Only enable when searchState is "movie"
  });

  // Infinite Query for TV Shows
  const {
    data: showData,
    fetchNextPage: fetchNextShowPage,
    hasNextPage: hasNextShowPage,
  } = useInfiniteQuery({
    queryKey: ["trendingShows", genreIds],
    queryFn: ({ pageParam = 1 }) => client.fetchShowList(pageParam, "tv", genreIds),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: searchState === "tv", // Only enable when searchState is "tv"
  });

  // Scroll handler for infinite scrolling
  useEffect(() => {
    if (!ref.current) {
      console.error("Scroll reference is not set up correctly.");
      return;
    }
    
    console.log("Setting up scroll event listener");

    const handleScroll = () => {
      if (!ref.current) return;

      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      console.log("Scroll positions:", { scrollTop, scrollHeight, clientHeight });

      if (scrollHeight - scrollTop <= clientHeight + 1) {
        if (searchState === "movie" && hasNextMoviePage) {
          console.log("Fetching next page for movies...");
          fetchNextMoviePage().catch(console.error);
        } else if (searchState === "tv" && hasNextShowPage) {
          console.log("Fetching next page for shows...");
          fetchNextShowPage().catch(console.error);
        }
      }
    };

    ref.current.addEventListener("scroll", handleScroll);
    console.log("Scroll event listener added");

    // Cleanup function to remove the event listener
    return () => {
      console.log("Removing scroll event listener");
      ref.current?.removeEventListener("scroll", handleScroll);
    };
  }, [searchState, fetchNextMoviePage, fetchNextShowPage, hasNextMoviePage, hasNextShowPage, ref]);

  // Conditionally combine the data from movies or shows
  const items = useMemo(() => {
    return searchState === "movie"
      ? movieData?.pages.flatMap((page) => page.results) ?? []
      : showData?.pages.flatMap((page) => page.results) ?? [];
  }, [movieData, showData, searchState]);

  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col items-center">
        <div className="my-4 w-full mx-auto">
          <div className="flex justify-center items-center space-x-4 py-2 cursor-pointer">
            <div onClick={() => setSearchState("movie")} className="cursor-pointer hover:underline">
              Movies
            </div>
            <div> | </div>
            <div onClick={() => setSearchState("tv")} className="cursor-pointer hover:underline">
              Shows
            </div>
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
                >
                  {name}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* Movie or Show Grid */}
      <div className="w-full px-4 md:px-0 py-5 flex justify-center">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6 w-full max-w-6xl px-4">
          {items.map((item: MovieListResult | ShowListResult) => (
            <div key={item.id} className="flex justify-center">
              {searchState === "movie" ? (
                <Moviebox
                  movie_id={item.id}
                  title={(item as MovieListResult).title ?? ""}
                  posterpath={item.poster_path}
                  item={item as MovieListResult}
                />
              ) : (
                <Showbox
                  show_id={item.id}
                  title={(item as ShowListResult).name ?? ""}
                  posterpath={item.poster_path}
                  item={item as ShowListResult}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
