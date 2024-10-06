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
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

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
  }: DefaultListListingProps) {
  const [isDragging, setIsDragging] = useState(false); // Track dragging state
  const scrollRef = useRef<HTMLDivElement>(null); // Reference to the scrollable container
  const startX = useRef(0); // Initial X position of the mouse
  const scrollLeft = useRef(0); // Initial scroll position

  // Mouse down event: Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current!.offsetLeft; // Get starting X position of mouse
    scrollLeft.current = scrollRef.current!.scrollLeft; // Get initial scroll position
    scrollRef.current!.style.cursor = 'grabbing'; // Set cursor style to grabbing
    e.preventDefault(); // Prevent default text selection behavior
  };

  // Mouse move event: Scroll when dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return; // Only move if dragging
    const x = e.pageX - scrollRef.current!.offsetLeft; // Calculate current mouse position
    const walk = (x - startX.current) * 2; // Determine how much to scroll (multiplier increases sensitivity)
    scrollRef.current!.scrollLeft = scrollLeft.current - walk; // Update the scroll position of the container
  };

  // Mouse up event: Stop dragging
  const handleMouseUp = () => {
    setIsDragging(false); // Stop dragging
    scrollRef.current!.style.cursor = 'grab'; // Change cursor back to grab
  };

  // Mouse leave event: Stop dragging if mouse leaves container
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false); // Stop dragging if mouse leaves container
      scrollRef.current!.style.cursor = 'grab'; // Reset cursor when dragging stops
    }
  }
  
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
        <div className="flex flex-col" key={list.name}>
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight">
              {list.name}
            </h1>
            <div className="text-sm font-light text-foreground tracking-tight">
              {list.description}
            </div>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollRef} // Reference for the scroll container
            className="flex flex-row w-full overflow-x-auto"  // Ensure horizontal scroll
            onMouseDown={handleMouseDown} // Start dragging
            onMouseMove={handleMouseMove} // Drag to scroll
            onMouseUp={handleMouseUp} // End dragging
            onMouseLeave={handleMouseLeave} // End dragging if mouse leaves
          >
            {list.listitem?.map((item, index) => (
              <Link to={"/"}>
              <div className="flex flex-col me-2" key={index}>
                <CrossfadeImage 
                  className="h-56 object-cover aspect-[3/4] rounded-md"
                  src={item.poster_path?.replace("original", "w200")} 
                />
                <h2 className="text-xl w-44 line-clamp-2">{item.title}</h2>
              </div>
              </Link>
            ))}
          </div>
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
