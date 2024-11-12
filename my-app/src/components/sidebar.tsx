import React, { useEffect } from "react";
import { type ListWithItems } from "../Data/userstore";
import { cn } from "../lib/utils";
import { contentFrom, ListWithPostersRpcResponse, selectListsByIdsWithPoster, type StoredUser } from "../Data/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { ImageGrid } from "./poster-item";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLinesVertical } from "@fortawesome/free-solid-svg-icons";
import PopupExample from "./AddListPopup";
import { useRefresh } from './RefreshContext'; // Import your context hook
import defualtlist from "./movieicon.png";
import { Link } from "react-router-dom";
import defualtFav from "./default_favorite_list.jpg"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: StoredUser | null;
  refreshPlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  signOut: () => void;
  playlists: ListWithItems[];
}

export function Sidebar({
  className,
  user,
}: SidebarProps) {
  const { shouldRefresh, setShouldRefresh } = useRefresh(); // Destructure context values

  const { data: listData, refetch } = useQuery({
    queryKey: ['user_lists', user?.user_id],
    queryFn: async () => await selectListsByIdsWithPoster(user?.user_id),
    refetchOnWindowFocus: true,
  });

 useEffect(() => {
    if (shouldRefresh) {
        refetch(); // Refetch the lists
        setShouldRefresh(false); // Reset shouldRefresh to prevent continuous refetching
    }
}, [shouldRefresh, refetch, setShouldRefresh]);


  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex">
            <FontAwesomeIcon className="mt-1 size-6" icon={faGripLinesVertical} />
            <p className="ml-1 text-lg">Your Library</p>
          </div>
          <div>
            <PopupExample />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {user !== null ? 
          <Link to={`/home/ulist/favorites`} state={{undefined}}>
            <div className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4">
              <div className="w-20 h-20 flex-shrink-0">
                <img src={defualtFav} alt="default favorite" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">Favorites</p>
                <p className="text-gray-500 text-sm">Created by: {user?.username}</p>
              </div>
            </div>
          </Link> : <div/>}

          {listData?.map((item: ListWithPostersRpcResponse) => (
            <Link to={`/home/ulist/${item.list_id}`} state={{ item }} key={item.list_id}>
              <div className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4">
                <div className="w-20 h-20 flex-shrink-0">
                  {item.ids && item.ids.length > 3 ? (
                    <ImageGrid images={contentFrom(item).map((it) => it.url)} />
                  ) : item.ids && item.ids.length > 0 ? (
                    <img 
                      src={item.ids[0].split(",").find(part => part.startsWith("https")) || defualtlist}
                      alt="list preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <img src={defualtlist} alt="default list" className="w-full h-full object-cover rounded-lg" />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{item.name}</p>
                  <p className="text-gray-500 text-sm">Created by: {item.username}</p>
                </div>
              </div>
            </Link>
        ))}

        </div>
      </div>
    </div>
  );
}
