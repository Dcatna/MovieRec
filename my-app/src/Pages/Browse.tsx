import {tmdbClient as client, movieResposneToContentItems, showResponseToContentItems} from '@/Data/TMDB-fetch';
import { ResourceType } from "@/types/MovieListResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import {  useUserStore, type ContentItem } from "@/Data/userstore";
import { useState, useMemo } from "react";
import genreData from "../Data/genres.json";
import { Badge } from "@/components/ui/Badge";
import ContentListItem from "@/components/ContentListItem";
import { useShallow } from "zustand/shallow";
import { useNavigate } from "react-router-dom";
import { useInfiniteScroller } from '@/lib/utils';

export interface Genre {
  id: number;
  name: string;
}

const BrowsePage = (
  { searchState }: { searchState: ResourceType  }
) => {

  const [genreIds, setGenreIds] = useState<number[]>([]);
  const genres = genreData.genres as Genre[];
  const favorites = useUserStore(useShallow(state => state.favorites))
  const navigate = useNavigate()

  const handleFilterButtons = (filter: number) => {
    setGenreIds((prevFilters: number[]) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((it) => it !== filter)
        : [...prevFilters, filter]
    );
  };

  // Infinite Query for Movies
  const {
    data,
    fetchNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["browse", genreIds, searchState],
    queryFn: async ({ pageParam = 1 }) => {
      if (searchState === "movie") {
        const data = await client.fetchMovieList(pageParam, "movie", genreIds)
        return {
          total_pages: data.total_pages,
          page: data.page,
          data: movieResposneToContentItems(data)
        }
      } else {
        const data = await  client.fetchShowList(pageParam, "tv", genreIds)
        return {
          total_pages: data.total_pages,
          page: data.page,
          data: showResponseToContentItems(data)
        }
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage === undefined) return 1
      if (lastPage !== undefined && (lastPage.page < lastPage.total_pages)) {
          return lastPage.page + 1;
      } else {
          return undefined;
      }
    },
  });


  useInfiniteScroller(0.99, !isLoading, async () => {
    await fetchNextPage()
  })
  
  const items = useMemo<ContentItem[]>(() => {
    const s = new Set<ContentItem>()
    return data?.pages.flatMap((it) => it.data).map((it) => {
      return {
        ...it,
        favorite: (favorites.find(f => f.id === it.id && f.isMovie === it.isMovie) !== undefined)
      } satisfies ContentItem
    }).filter((v) => {
      if (s.has(v)) {
        return false
      } else {
        s.add(v)
        return true
      }
    }) ?? []
  }, [data, favorites]);
  console.log(items)
  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center">
        <div className="my-4 w-full mx-auto">
          <div className="flex justify-center items-center space-x-4 py-2 cursor-pointer">
            <div onClick={() => navigate("/browse/movie")} className="cursor-pointer hover:underline">
              Movies
            </div>
            <div> | </div>
            <div onClick={() => navigate("/browse/show")} className="cursor-pointer hover:underline">
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
      <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-6 h-full space-x-1 space-y-1 mx-2">
          {items.map((item) => (
               <ContentListItem
                  key={`${item.id}-${item.isMovie}-${item.favorite}`}
                  className='w-auto aspect-[2/3]'
                  favorite={item.favorite}
                  contentId={item.id}
                  description={item.description}
                  isMovie={item.isMovie}
                  title={item.name}
                  posterUrl={item.posterUrl ?? ""}
                  onClick={() => navigate(`/${item.isMovie ? "movie" : "show"}/${item.id}`)}
             />
          ))}
        </div>
    </div>
  );
};

export default BrowsePage;
