import { useShallow } from "zustand/shallow";
import { useUserStore } from "../Data/userstore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/Data/supabase-client";
import { FastAverageColor } from "fast-average-color";
import { Skeleton } from "./ui/skeleton";

export function UserProfileImage({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const user = useUserStore(useShallow((state) => state.userdata?.stored));
  const [dominantRgb, setDominantRgb] = useState("rgba(0, 0, 0, 0)");



  useEffect(() => {
    const fac = new FastAverageColor();
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = supabase.storage.from('profile_pictures').getPublicUrl(user?.profile_image??"").data.publicUrl;

    image.onload = () => {
      fac.getColorAsync(image).then((c) => {
        console.log(c.rgba);
        setDominantRgb(c.rgba); // Set the rgba value as the dominant color
      });
    };
  }, [user]);

  return (
    <div className={cn("relative w-fit h-fit")}>
      <Avatar key={(user?.profile_image ?? "" )+user?.user_id}
        className={cn(className, "relative z-10 rounded-full")}
        style={{
          boxShadow: `
            0 0 5px ${dominantRgb}, 
            0 0 10px ${dominantRgb}, 
            0 0 20px ${dominantRgb}, 
            0 0 30px ${dominantRgb}, 
            0 0 40px ${dominantRgb}
          `,
        }}
      >
        <AvatarImage 
        className="h-full w-full rounded-full" 
        src={supabase.storage.from('profile_pictures').getPublicUrl(user?.profile_image??"").data.publicUrl} />
        <AvatarFallback className="h-full w-full rounded-full">
          <Skeleton className="h-full w-full rounded-full"/>
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
