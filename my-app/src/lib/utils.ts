import { useScrollContext } from "@/ScrollContext";
import { clsx, type ClassValue } from "clsx";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const range = (start: number, stop: number, step: number = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export type Result<T, E = string> =
  | { error: E; ok: false }
  | { data: T; ok: true };

export function successResult<T, E = string>(data: T): Result<T, E> {
  return { data, ok: true };
}

export function failureResult<T, E = string>(error: E): Result<T, E> {
  return { error, ok: false };
}

export function getOrDefault<T, E = string>(
  result: Result<T, E>,
  defaultValue: T
): T {
  if (result.ok) {
    return result.data;
  } else {
    return defaultValue;
  }
}

export function getOrNull<T, E = string>(result: Result<T, E>): T | undefined {
  if (result.ok) {
    return result.data;
  } else {
    return undefined;
  }
}

export function getOrThrow<T, E = string>(result: Result<T, E>): T {
  if (result.ok) {
    return result.data;
  } else {
    if (typeof result.error === typeof Error) {
      throw result.error;
    } else {
      throw new Error(String(result.error));
    }
  }
}

export const useInfiniteScroller = (
  scrolledPct: number,
  enabled: boolean,
  onScrolledToBreakpoint: () => void
) => {
  const { ref } = useScrollContext();

  // useEffect(() => {
  //   const handleScroll = () => {
  //     // Check if the window is scrolled to the bottom
  //     if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight * scrolledPct) {
  //       if (enabled) {
  //         console.log("You've reached the bottom of the page window!");
  //         onScrolledToBreakpoint()
  //       }
  //     }
  //   };

  //   // Add the scroll event listener
  //   window.addEventListener('scroll', handleScroll);

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [enabled, scrolledPct]);

  useEffect(() => {
    const scrollableDiv = ref.current;
    const handleScroll = () => {
      if (scrollableDiv) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableDiv;
        if (scrollTop + clientHeight >= scrollHeight * scrolledPct) {
          if (enabled) {
            console.log("You've reached the bottom of the page ref!");
            onScrolledToBreakpoint()
          }
        }
      }
    };
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScroll);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [scrolledPct, onScrolledToBreakpoint, ref]);
};
