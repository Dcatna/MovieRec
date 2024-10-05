import { useShallow } from "zustand/shallow";
import { useUserStore } from "../Data/userstore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PersonIcon } from "@radix-ui/react-icons";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getProfileImageUrl } from "@/Data/supabase-client";
import { FastAverageColor } from "fast-average-color";

export function UserProfileImage({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const user = useUserStore(useShallow((state) => state.stored));
  const [dominantRgb, setDominantRgb] = useState("rgba(0, 0, 0, 0)");

  const imgSrc = useMemo(() => {
    return (
      getProfileImageUrl(user?.profile_image ?? "", { download: true }) ?? ""
    );
  }, [user?.profile_image]);

  useEffect(() => {
    const fac = new FastAverageColor();
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imgSrc;

    image.onload = () => {
      fac.getColorAsync(image).then((c) => {
        console.log(c.rgba);
        setDominantRgb(c.rgba); // Set the rgba value as the dominant color
      });
    };
  }, [imgSrc]);

  return (
    <div className={cn("relative w-fit h-fit")}>
      <Avatar
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
        <AvatarImage className="h-full w-full rounded-full" src={imgSrc} />
        <AvatarFallback className="h-full w-full rounded-full">
          <PersonIcon />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
