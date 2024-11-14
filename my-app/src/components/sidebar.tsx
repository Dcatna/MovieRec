import React, { ReactNode, useRef } from "react";
import { useUserStore } from "../Data/userstore";
import { ImageGrid, ListPreviewItem } from "./poster-item";
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
import { contentFrom, supabase } from "@/Data/supabase-client";
import type { LucideIcon } from "lucide-react";
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
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
import { GlobeIcon, HomeIcon, SearchIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";
import ContentListItem from "./ContentListItem";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import favorites_list_icon from "./default_favorite_list.jpg"

const data = [
  {
    title: "Browse",
    url: "/browse",
    icon: () => <GlobeIcon />,
  },
  {
    title: "Search",
    url: "/search",
    icon: () => <SearchIcon />,
  },
  {
    title: "Home",
    url: "/home",
    icon: () => <HomeIcon />,
  },
];

function SidebarItem(props: {
  name: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { state } = useSidebar();
  const open = state === "expanded" || state === "extra";
  return (
    <div className="space-y-1">
      <Button
        variant={props.selected ? "default" : "ghost"}
        className={cn("w-full", open ? "justify-start" : "justify-center")}
        size={open ? "lg" : "icon"}
        onClick={props.onClick}
      >
        <div className="stroke-2 fill-none me-4">{props.children}</div>
        {open ? <text>{props.name}</text> : undefined}
      </Button>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore(useShallow((state) => state.userdata?.stored));
  const signOut = useUserStore((state) => state.signOut);
  const createList = useUserStore((state) => state.createList);
  const location = useLocation();
  const navigate = useNavigate();

  const { state, setOpen } = useSidebar();
  const open = state === "expanded" || state === "extra";
  return (
    <Sidebar
      {...props}
      collapsible="icon"
      className="max-h-screen overflow-hidden"
    >
      <SidebarHeader>
        {/* <ProfileImage /> */}
        <Card>
          <SidebarGroup>
            <SidebarGroupLabel>Quick access</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-4">
              {data.map((item) => {
                return (
                  <SidebarItem
                    name={item.title}
                    selected={location.pathname.includes(item.url)}
                    onClick={() => navigate(item.url)}
                  >
                    <item.icon></item.icon>
                  </SidebarItem>
                );
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        </Card>
      </SidebarHeader>
      <SidebarContent>
        <ListTable></ListTable>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function ListTable({}) {
  const lists = useUserStore((state) => state.lists);
  //const favorites = useUserStore((state) => state.favorites)
  const user = useUserStore(useShallow((state) => state.userdata?.stored));

  const { state } = useSidebar();

  // if (state === "collapsed") {
  //   return (
  //     <div className="flex flex-col space-y-2 p-4">
  //       {lists.map((item) => {
  //         return (
  //           <div key={item.list_id}  className="w-full max-w-18">
  //             <ImageGrid images={contentFrom(item).map((it) => it.url)} />
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }

  const open = state === 'expanded' || state === "extra"
  const navigate = useNavigate();
  return (
    <Table>
      {/* <TableCaption>Mods available to download.</TableCaption> */}
      <TableHeader>
        <TableRow>
          {open ? <TableHead>{state === "extra" ? "List" : ""}</TableHead>:undefined}
          {open ? <TableHead>List Name</TableHead>:undefined}
          {open ? <TableHead>Created By</TableHead>: undefined}
        </TableRow>
      </TableHeader>
      <TableBody>
        {user ? <TableRow onClick={() => navigate("/favorites")}>
          <TableCell>
            <div className="w-[6rem]" >
              <img src={favorites_list_icon} alt="Favorites" />
            </div>
          </TableCell>
          {open ? <TableCell className="font-medium text-base">Favorites</TableCell>: undefined}
              {open ? <TableCell className="font-medium text-base">{user.username}</TableCell>: undefined}
        </TableRow> : undefined}
        {lists.map((item) => {
          return (
            <TableRow onClick={() => navigate(`list/${item.list_id}`)}>
              <TableCell className="font-medium max-w-22" >
                <div className="w-[6rem]">
                  <ImageGrid key={item.list_id} images={contentFrom(item).map((it) => it.url)} />
                </div>

              </TableCell>
              {open ? <TableCell className="font-medium text-base">{item.name}</TableCell>: undefined}
              {open ? <TableCell className="font-medium text-base">{item.username}</TableCell>: undefined}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function ProfileImage() {
  const user = useUserStore(useShallow((state) => state.userdata?.stored));

  return (
    <div className="flex flex-grow-0">
      <img
        className="w-full max-w-52 aspect-square rounded-full"
        src={
          supabase.storage
            .from("profile_pictures")
            .getPublicUrl(user?.profile_image ?? "").data.publicUrl
        }
      />
    </div>
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
