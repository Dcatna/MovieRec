import { CrossfadeImage } from "@/components/crossfade-image";
import { ListPreviewItem } from "@/components/poster-item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  contentFrom,
  getListWithPosters,
  ListWithPostersRpcResponse,
  selectListsByUserId,
} from "@/Data/supabase-client.ts";
import { ListItem, ListWithItems } from "@/Data/userstore";
import { cn, range } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ScrollContainer from 'react-indiana-drag-scroll';
const DEFAULT_LIST_USER = "c532e5da-71ca-4b4b-b896-d1d36f335149"
const convertListItemsToResponse = (
  items: ListItem[],
  listInfo: Partial<ListWithPostersRpcResponse>
): ListWithPostersRpcResponse => {
  return {
    created_at: listInfo.created_at || "",
    description: listInfo.description || "",
    list_id: listInfo.list_id || "",
    name: listInfo.name || "Unnamed List",
    public: listInfo.public || false,
    updated_at: listInfo.updated_at,
    user_id: listInfo.user_id || "",
    username: listInfo.username || "Unknown",
    profile_image: listInfo.profile_image,
    ids: items.map((item) => (item.movie_id !== -1 ? String(item.movie_id) : String(item.show_id))),
    total: items.length,
  };
};
export function HomePage() {
  const recent = useQuery({
    queryKey: ["recent"],
    queryFn: () =>
      getListWithPosters("select_most_recent_lists_with_poster_items", 10, 0),
  });

   const popular = useQuery({
    queryKey: ["popular"],
    queryFn: () =>
      getListWithPosters("select_most_popular_lists_with_poster_items", 10, 0),
  });

  
  const defaultList = useQuery({
    queryKey: ["default_user"],
    queryFn: () => selectListsByUserId(DEFAULT_LIST_USER)
  });


  return (
    <div className="h-full w-full pt-12 mx-4 flex flex-col overflow-y-auto overflow-x-hidden">
      <UserCreatedListListing 
        title="Recently created"
        data={recent.data ?? undefined}
        error={recent.error}
        loading={recent.isLoading}
      />
       <UserCreatedListListing 
        title="Most popular"
        data={popular.data ?? undefined}
        error={popular.error}
        loading={popular.isLoading}
      />
      <DefaultListListing 
        className=""
        data={defaultList.data ?? undefined} 
        error={defaultList.error} 
        loading={defaultList.isLoading}
        />
    </div>
  );
}

interface UserListListingProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  title: string
  data: ListWithPostersRpcResponse[] | undefined;
  error: unknown;
}

interface DefaultListListingProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  data: ListWithItems[] | undefined;
  error: unknown;
}

const loadingRange = range(0, 10, 1);

function DefaultListListing(
  {
    className,
    loading,
    data,
    error,
  }: DefaultListListingProps) {

  if (loading) {
    return (
      <ListLoadingElement></ListLoadingElement>
    )
  }

  if (error) {
    return (<div>{error.toString()}</div>)
  }

  return (
    <div className={className}>
      {data?.map((list) => {
        const convertedList = convertListItemsToResponse(list.listitem!, {
          created_at: list.created_at,
          description: list.description,
          list_id: list.list_id,
          name: list.name,
          public: Boolean(list.public),
          user_id: list.user_id,
          username: list.user_id,
          profile_image: "",
        });
  
        return (
          <div className="flex flex-col" key={convertedList.list_id}>
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                {convertedList.name}
              </h1>
              <div className="text-sm font-light text-foreground tracking-tight">
                {convertedList.description}
              </div>
            </div>
  
            <ScrollContainer
              className="scroll-container flex flex-row w-full overflow-x-auto h-max-screen"
              hideScrollbars={false}
            >
              {list.listitem?.map((item, index) => (
                <Link
                  to={item.movie_id !== -1 ? `/movieinfo` : `/showinfo`}
                  state={
                    item.movie_id === -1
                      ? { // Show state
                          show_id: item.show_id,
                          title: item.title || undefined,
                          posterpath: item.poster_path || undefined,
                          item: item || undefined, // Pass the whole item if available
                          type: "show" // Additional flag to specify type
                        }
                      : { // Movie state
                          movie_id: item.movie_id,
                          title: item.title || undefined,
                          posterpath: item.poster_path || undefined,
                          item: item || undefined, // Pass the whole item if available
                          type: "movie" // Additional flag to specify type
                        }
                  }
                  key={index}
                >
                  <div className="flex flex-col me-2">
                    <CrossfadeImage
                      className="h-56 object-cover aspect-[3/4] rounded-md"
                      src={item.poster_path?.replace("original", "w200")}
                    />
                    <h2 className="text-xl w-44 line-clamp-2">
                      {item.title}
                    </h2>
                  </div>
                </Link>
              ))}
            </ScrollContainer>
          </div>
        );
      })}
    </div>
  );
  
}

function ListLoadingElement(props: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(props.className, "flex flex-row overflow-hidden")}>
      {loadingRange.map(() => {
        return (
          <div className="aspect-square m-2 space-y-3">
            <Skeleton className="h-5/6 w-full object-cover rounded-lg object-top fade-in" />
              <div className="space-y-2 h-1/6">
                <Skeleton className="h-4 w-1/2" />
              </div>
          </div>
        );
      })}
    </div>
  );
}

function UserCreatedListListing({
  className,
  title,
  loading,
  data,
  error,
}: UserListListingProps) {
  if (loading) {
    return <ListLoadingElement className={className} />;
  }

  if (error) {
    return <div>{error.toString()}</div>;
  }

  return (
    <div className="flex flex-col">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          {title}
      </h1>
      <div className={cn(className, "grid grid-cols-8 overflow-hidden")}>
      {data?.map((item) => {
        return (
          <div className="w-ful l">
            <Link to={`/home/list/${item.list_id}`} state={{ item }} key={item.list_id}>
              <ListPreviewItem
                className="p-2 max-w-full overflow-hidden"
                title={item.name}
                description={item.description}
                images={contentFrom(item).map((it) => it.url)}
              >
              </ListPreviewItem>
            </Link>
          </div>
        );
      })}
    </div>
  </div>
  );
}

export default HomePage;
