import { CrossfadeImage } from "@/components/crossfade-image";
import { ListPreviewItem } from "@/components/poster-item";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  contentFrom,
  getListWithPosters,
  ListWithPostersRpcResponse,
  selectListsByUserId,
} from "@/Data/supabase-client.ts";
import { ListWithItems } from "@/Data/userstore";
import { cn, range } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_LIST_USER = "c532e5da-71ca-4b4b-b896-d1d36f335149"

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
  }: DefaultListListingProps
) {

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
      {data?.map((list) => (
        <div className="flex flex-col">
          <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight">
          {list.name}
          </h1>
          <div className="text-sm font-light text-foreground tracking-tight">
            {list.description}
          </div>
            </div>
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {list.listitem?.map((item, index) => (
                    <CarouselItem className={"basis-[1/9] overflow-clip my-4"} key={index}>
                      <div className="flex flex-col me-2">
                        <CrossfadeImage 
                            className="h-56 object-cover aspect-[3/4] rounded-md"
                            src={item.poster_path?.replace("original", "w200")} 
                        />
                        <h2 className="text-xl w-44 line-clamp-2">{item.title}</h2>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
          </div>
          ))}
      </div>
  )
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
            <ListPreviewItem
              className="p-2 max-w-full overflow-hidden"
              title={item.name}
              description={item.description}
              images={contentFrom(item).map((it) => it.url)}
            >
            </ListPreviewItem>
          </div>
        );
      })}
    </div>
  </div>
  );
}

export default HomePage;
