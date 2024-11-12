import React from "react";
import { useUserStore } from "../Data/userstore";
import { cn } from "../lib/utils";
import { ImageGrid } from "./poster-item";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLinesVertical } from "@fortawesome/free-solid-svg-icons";
import PopupExample from "./AddListPopup";
import defualtlist from "./movieicon.png";
import { Link } from "react-router-dom";
import defualtFav from "./default_favorite_list.jpg";
import { useShallow } from "zustand/shallow";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Sidebar({ className }: SidebarProps) {
  
  const user = useUserStore(useShallow(state => state.userdata?.stored))
  const lists = useUserStore(useShallow((state) => state.lists));

  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex">
            <FontAwesomeIcon
              className="mt-1 size-6"
              icon={faGripLinesVertical}
            />
            <p className="ml-1 text-lg">Your Library</p>
          </div>
          <div>
            <PopupExample />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {user !== null ? (
            <Link to={`/home/ulist/favorites`} state={{ undefined }}>
              <div className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4">
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={defualtFav}
                    alt="default favorite"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">Favorites</p>
                  <p className="text-gray-500 text-sm">
                    Created by: {user?.username}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {lists.map((item) => {
            const images =
              item.listitem
                ?.slice(0, 4)
                .map((it) => it.poster_path)
                .filter((it) => it !== undefined) ?? [];
            return (
              <Link to={`/home/ulist/${item.list_id}`} state={{ item }}>
                <div className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4">
                  <div className="w-20 h-20 flex-shrink-0">
                    {images.length > 3 ? (
                      <ImageGrid images={images} />
                    ) : (
                      <img
                        src={images[0] ?? defualtlist}
                        alt="list preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      Created by: {item.name}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
