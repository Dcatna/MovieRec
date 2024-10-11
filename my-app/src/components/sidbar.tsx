import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { type ListWithItems } from "../Data/userstore";
import { cn } from "../lib/utils";
import { contentFrom, ListWithPostersRpcResponse,selectListsByIdsWithPoster, type StoredUser } from "../Data/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { ImageGrid } from "./poster-item";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>{
  user: StoredUser | null
  refreshPlaylist: () => void
  onDeletePlaylist: (id: string) => void
  signOut: () => void
  playlists: ListWithItems[]

}
export function Sidebar({
  className,
  user,
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const listQuery = useQuery({
    queryKey: ['user_lists', user?.user_id],
    queryFn: async () => {
        return await selectListsByIdsWithPoster(user?.user_id)
    },
}).data as ListWithPostersRpcResponse[]
  console.log("LSITSTLIS", listQuery)
  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <button onClick={() => navigate("auth")}>Sign In</button>
        <div className="grid grid-cols-1 gap-4">
          {listQuery?.map((item: ListWithPostersRpcResponse) => (
            <div key={item.list_id} className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4">
              <div className="w-20 h-20 flex-shrink-0">
                <ImageGrid images={contentFrom(item).map((it) => it.url)} />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">{item.name}</p>
                <p className="text-gray-500 text-sm">Created by: {item.user_id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
