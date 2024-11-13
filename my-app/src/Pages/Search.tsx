import { Skeleton } from "@/components/ui/skeleton";
import {
  movieResposneToContentItems,
  showResponseToContentItems,
  tmdbClient as client,
} from "@/Data/TMDB-fetch";
import {
  ResourceType,
} from "@/types/MovieListResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInfiniteScroller } from "@/lib/utils";
import { ContentItem, useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import ContentListItem from "@/components/ContentListItem";

const SearchPage = ({ searchState }: { searchState: ResourceType }) => {

  const [searchParam, setSearchParam] = useSearchParams();
  const [searching, setSearching] = useState<boolean>(false);
  const favorites = useUserStore(useShallow((state) => state.favorites));
  const navigate = useNavigate();

  const search = searchParam.get("query") ?? ""

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["search", search, searchState],
    queryFn: async ({ pageParam = 1 }) => {
      if (searchState === "movie") {
        const data = await client.fetchMovieSearchList(
          pageParam,
          "movie",
          search
        );
        return {
          total_pages: data.total_pages,
          page: data.page,
          data: movieResposneToContentItems(data),
        };
      } else {
        const data = await client.fetchShowSearchList(
          pageParam,
          "tv",
          search
        );
        return {
          total_pages: data.total_pages,
          page: data.page,
          data: showResponseToContentItems(data),
        };
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });


  useInfiniteScroller(0.95, !isLoading, () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  });

  const items = useMemo<ContentItem[]>(() => {
    const s = new Set<ContentItem>();
    return (
      data?.pages
        .flatMap((it) => it.data)
        .map((it) => {
          return {
            ...it,
            favorite:
              favorites.find(
                (f) => f.id === it.id && f.isMovie === it.isMovie
              ) !== undefined,
          } satisfies ContentItem;
        })
        .filter((v) => {
          if (s.has(v)) {
            return false;
          } else {
            s.add(v);
            return true;
          }
        }) ?? []
    );
  }, [data, favorites]);

  useEffect(() => {
    setSearching(true);
    const delayInputTimeoutId = setTimeout(() => {
      setSearching(false);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchParam["query"], 500]);

  return (
    <body className="overflow-x-hidden">
      <div className="flex flex-col items-center">
        <div className="my-4 w-full max-w-md mx-auto">
          <div className="flex justify-center items-center space-x-4 py-2 cursor-pointer">
            <div onClick={() => navigate("/search/movie")} className="">
              Movies
            </div>
            <div> | </div>
            <div onClick={() => navigate("/search/show")}>Shows</div>
          </div>
          <input
            type="text"
            onChange={(event) => {
              setSearchParam(prev => {
                prev.set("query", event.target.value);
                return prev
              })
              
            }}
            className="w-full p-2 border border-gray-300 rounded-lg text-black"
            placeholder={
              searchState == "movie" ? "Search movies..." : "Search shows..."
            }
          />
        </div>
        <ItemsGrid items={items} searching={searching} />
      </div>
    </body>
  );
};
type ItemProps = {
  items: ContentItem[];
  searching: boolean;
};

const ItemsGrid = ({ items, searching }: ItemProps) => {

  const navigate = useNavigate()

  if (searching) {
    return (
      <div className="w-full px-4 md:px-0">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 p-12">
          {Array.from(Array(40).keys()).map((idx) => {
            return (
              <div className="flex flex-col space-y-3 p-6" key={idx}>
                <Skeleton className="h-[300px] w-[220px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-9/12" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full px-4 md:px-0 p-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 p-6">
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
  }
};
export default SearchPage;
