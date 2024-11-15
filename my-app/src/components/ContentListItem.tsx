import React, { useLayoutEffect, useRef, useState } from "react";
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
  imgSize?: number
  onClick?: () => void
}

type Size = { v: string, px: number }
const sizes: Array<Size> = [
  {v: "w92", px: 92},
  {v:"w154", px: 154},
  {v:"w185", px: 185},
  {v:"w342", px: 342},
  {v:"w500", px: 500},
  {v:"w780", px: 780},
  {v:"original", px: 9999} // "original" is the largest option
]

const getClosestSize = (widthPx: number): string => {
  // Find the closest size
  const closestSize = sizes.minByOrNull<Size, number>((e) => {
    if (widthPx <= e.px) {
      return e.px - widthPx 
    } else {
      return 9999
    }  
  })

  return closestSize?.v ?? "w780"
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

  const src = props.posterUrl.replace("original", getClosestSize(props.imgSize ?? 700))
  console.log(src)
  return (
    <div>
      <div className={cn(props.className, "aspect-[2/3] relative group")} onClick={() => { props.onClick?.() }}>
        <img 
          className="object-cover w-full h-full rounded-md" 
          loading="lazy"
          src={src} 
          alt={props.title} 
        />
        <div className="rounded-md absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full h-4/6"/>
        <div className="rounded-md absolute bottom-0 left-0 h-full w-full hover:bg-gradient-to-t from-slate-900 to-transparent bg-transparent"/>
        <span
              className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce text-white">
                {props.title}
        </span>
        <div className="absolute top-0 right-0 m-2 z-10">
        <Button variant={'default'} size={'icon'} onClick={(e) => {
          e.stopPropagation()
          toggleFavorite()
          }}>

          {props.favorite ? <HeartFilledIcon/> : <Heart/>}
        </Button>
        </div>
    </div>
  </div>
  );
};

export default ContentListItem
