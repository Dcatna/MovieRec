import React, { useRef } from "react";
import { useUserStore } from "../Data/userstore";
import { cn } from "../lib/utils";
import { ImageGrid } from "./poster-item";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLinesVertical } from "@fortawesome/free-solid-svg-icons";
import defualtlist from "./movieicon.png";
import { Link } from "react-router-dom";
import defualtFav from "./default_favorite_list.jpg";
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

export function Sidebar({ className }: SidebarProps) {

  const user = useUserStore(useShallow((state) => state.userdata?.stored));
  const lists = useUserStore(useShallow((state) => state.lists));
  const signOut = useUserStore((state) => state.signOut);
  const createList = useUserStore((state) => state.createList);

  return (
    <div className={cn("pb-12 h-full", className)}>
      {user ? (
        <div className="mx-4 my-6 flex flex-col">
          <UserProfileImage className="w-full h-52" />
          <div className="flex flex-row my-6 justify-between items-center">
            <text className="text-2xl">{user?.username}</text>
            <Button onClick={signOut}>Sign out</Button>
          </div>
        </div>
      ) : undefined}
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex">
            <FontAwesomeIcon
              className="mt-1 size-6"
              icon={faGripLinesVertical}
            />
            <p className="ml-1 text-lg">Your Library</p>
          </div>
          <CreateListDialog
            onConfirm={(name, description, pub) =>
              createList(name, description, pub)
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {user !== null ? (
            <Link
              to={`/profile/${user?.user_id}/favorites`}
              state={{ undefined }}
            >
              <div
                key="favorite_pinned"
                className="flex items-center space-x-4 rounded-lg bg-white shadow-md p-4"
              >
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
          ) : undefined}

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
        </div>
      </div>
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
