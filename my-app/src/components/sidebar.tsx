import React, { useRef } from "react";
import { useUserStore } from "../Data/userstore";
import { ImageGrid } from "./poster-item";
import defualtlist from "./movieicon.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { UserProfileImage } from "./user-profile-image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { contentFrom } from "@/Data/supabase-client";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { HomeIcon } from "lucide-react";
const data = [
  {
    title: "Browse",
    url: "/browse",
    items: [
      {
        title: "Movies",
        url: "/browse/movie",
      },
      {
        title: "Shows",
        url: "/browse/show",
      },
    ],
  },
  {
    title: "Search",
    url: "/search",
    items: [
      {
        title: "Movies",
        url: "/search/movie",
      },
      {
        title: "Shows",
        url: "/search/show",
      },
    ],
  },
  {
    title: "Home",
    url: "/home",
    items: [
      {
        title: "Discover",
        url: "/home",
      },
      {
        title: "Profile",
        path: "/profile",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore(useShallow((state) => state.userdata?.stored));
  const signOut = useUserStore((state) => state.signOut);
  const createList = useUserStore((state) => state.createList);
  const location = useLocation();
  const navigate = useNavigate();

  const lists = useUserStore((state) => state.lists);
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  const expanded = state === "expanded";

  return (
    <Sidebar {...props} className="max-h-screen overflow-hidden">
      <SidebarHeader>
      {expanded ? (
        <div>
          {user ? (
            <div className="flex flex-col">
              <UserProfileImage
                className={cn("w-full", expanded ? "h-52 mx-4 my-6" : "")}
              />
              <div className="flex flex-row justify-between items-center">
                <text className="text-2xl">{user?.username}</text>
                <Button onClick={signOut}>Sign out</Button>
              </div>
              <CreateListDialog
                onConfirm={(name, desc, pub) => createList(name, desc, pub)}
              ></CreateListDialog>
            </div>
          ) : (
            <div>
              <Link to={"/auth"}>
                <Button>Create an account</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          {user ? <UserProfileImage className={cn("w-full")} /> : undefined}
        </div>
      )}
   <div className="flex flex-col space-y-4">
          {data.map((item) => {
            return (
              <div>
                {expanded ? (
                  <SidebarGroup key={item.title}>
                    <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {item.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={item.url === location.pathname}
                            >
                              <a onClick={() => navigate(item.url ?? "")}>
                                {item.title}
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ) : (
                  <Button size={"icon"}>
                    <HomeIcon />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {lists.map((item) => {
          const images = contentFrom(item)?.map((it) => it.url) ?? [];
          return (
            <Link to={`/list/${item.list_id}`} state={{ item }}>
              <div
                key={item.list_id}
                className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4"
              >
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function CreateListDialog({
  onConfirm,
}: {
  onConfirm: (name: string, description: string, pub: boolean) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog>
      <DialogTrigger>Create</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a name for the list</DialogTitle>
          <DialogDescription>
            This will create a new list with the name below and will default to
            a private list.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="List name"
              ref={nameRef}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              defaultValue="list description"
              ref={descriptionRef}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button>Cancel </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() =>
                onConfirm(
                  nameRef.current?.value ?? "",
                  descriptionRef.current?.value ?? "",
                  false
                )
              }
            >
              Create
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
