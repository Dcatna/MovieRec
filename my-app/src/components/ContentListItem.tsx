import React from "react";
import { useUserStore } from "@/Data/userstore";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { Heart } from "lucide-react";

export interface ContentItemProps extends React.HTMLAttributes<HTMLDivElement> {
  contentId: number;
  isMovie: boolean
  title: string;
  posterUrl: string;
  description: string
  favorite: boolean,
  onClick?: () => void
}

const ContentListItem = (props: ContentItemProps) => {
  
  const toggleItemFavorite = useUserStore(state => state.toggleItemFavorite)

  const toggleFavorite = () => {
    console.log("toggled favorite")
    toggleItemFavorite(
      {
        id: props.contentId,
        description: props.description,
        favorite: props.favorite,
        isMovie: props.isMovie,
        posterUrl: props.posterUrl,
        name: props.title
      }
    )
  }

  return (
    <div className={cn(props.className, "aspect-[2/3] relative group")} onClick={() => { props.onClick?.() }}>
      <img 
        className="object-cover w-full h-full rounded-md" 
        src={props.posterUrl} 
        alt={props.title} 
      />
      <div className="rounded-md absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full h-4/6"/>
      <div className="rounded-md absolute bottom-0 left-0 h-full w-full hover:bg-gradient-to-t from-slate-900 to-transparent bg-transparent"/>
      <span
            className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce text-white">
              {props.title}
      </span>
      <div className="absolute top-0 right-0 m-2 z-10">
      <Button variant={'default'} size={'icon'} onClick={toggleFavorite}>
        {props.favorite ? <HeartFilledIcon/> : <Heart/>}
      </Button>
      </div>
  </div>
  );
};

export default ContentListItem
