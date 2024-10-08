import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BananaIcon,
  GlobeIcon,
  LibraryIcon,
  RefreshCwIcon,
  LogInIcon,
  SparkleIcon,
  TrainIcon,
  TrashIcon,
  WavesIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { Card } from "./ui/card";
import { type ListWithItems } from "../Data/userstore";
import { cn } from "../lib/utils";
import { type StoredUser } from "../Data/supabase-client";
import { UserProfileImage } from "./user-profile-image";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: StoredUser | null
  refreshPlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  signOut: () => void;
  playlists: ListWithItems[];
}

function SidebarItem(props: {
  name: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Button
        variant={props.selected ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={props.onClick}
      >
        <div className="stroke-2 fill-none me-4">{props.children}</div>
        {props.name}
      </Button>
    </div>
  );
}

const games = [
  { game: "Genshin Impact", path: "genshin", icon: <SparkleIcon /> },
  { game: "Honkai Star Rail", path: "starrail", icon: <TrainIcon /> },
  { game: "Zenless Zone Zero", path: "zenless", icon: <GlobeIcon /> },
  { game: "Wuthering Waves", path: "wuwa", icon: <WavesIcon /> },
];

export function Sidebar({
  className,
  signOut,
  playlists,
  onDeletePlaylist,
  refreshPlaylist,
  user,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {user?.username ?? "Signed out"}
          </h2>
          <UserProfileImage 
            className="h-48 w-48 my-8"
          />
          {user === null ? 
          <SidebarItem
            onClick={() => navigate("auth")}
            name="Sign In"
            selected={location.pathname.includes("auth")}
          >
            {<LogInIcon />}
          </SidebarItem> : undefined}
          {user !== null ? 
          <SidebarItem
            onClick={signOut}
            name="Sign out"
            selected={false}
          >
            {<LogInIcon />}
          </SidebarItem> : undefined}
        </div>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Discover
        </h2>
        <SidebarItem
          onClick={() => {}}
          name="Game Bannana"
          selected={location.pathname.includes("mods")}
        >
          {<BananaIcon />}
        </SidebarItem>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Library
        </h2>
        <SidebarItem
          onClick={() => navigate("/playlist")}
          name="Playlists"
          selected={location.pathname === "/playlist"}
        >
          {<LibraryIcon />}
        </SidebarItem>
        {games.map(({ game, path, icon }) => {
          return (
            <SidebarItem
              name={game}
              onClick={() => navigate(path)}
              selected={location.pathname.includes(path)}
            >
              {icon}
            </SidebarItem>
          );
        })}
      </div>

      <div className="px-3 py-2">
        <div className="flex flex-row justify-between items-baseline w-full">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <Button
            onPointerDown={refreshPlaylist}
            size={"icon"}
            variant={"ghost"}
          >
            <RefreshCwIcon className="h-4" />
          </Button>
        </div>
        <Card className="max-h-[calc(30vh)] overflow-y-auto">
          <div className="space-y-1 p-2 flex flex-col">
            {playlists.map((playlist, i) => (
              <div className="flex flex-row">
                <Button
                  key={`${playlist.list_id}-${i}`}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                  {playlist.name}
                </Button>
                <Button
                  onPointerDown={() => onDeletePlaylist(playlist.list_id)}
                  variant={"ghost"}
                  size={"icon"}
                >
                  <TrashIcon></TrashIcon>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
