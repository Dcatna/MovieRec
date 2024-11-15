import { useScrollContext } from "@/ScrollContext";
import { clsx, type ClassValue } from "clsx";
import React, { useState } from "react";
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

function minByOrNull<T, R >(this: Array<T>, selector: (v: T) => R): T | undefined {
  if (!(this.length > 0)) return undefined
  var minElem = this[0]
  if (!(this.length > 1)) return minElem
  var minValue = selector(minElem)
  for (let i = 1; i < this.length; ++i) {
    const e = this[i]
    const v = selector(e)
    if (minValue > v) {
      minElem = e
      minValue = v
    }
  }
  return minElem
}

declare global {
  interface Array<T> {
    minByOrNull<T, R>(selector: (v: T) => R): T | undefined
  }
}

Array.prototype.minByOrNull = minByOrNull

export const useInfiniteScroller = (
  scrolledPct: number,
  enabled: boolean,
  onScrolledToBreakpoint: () => Promise<void>
) => {
  const { ref } = useScrollContext();

  const [lock, setLock] = useState(false)
  const callback = React.useCallback(async () => {
    if (enabled) {
      console.log("You've reached the bottom of the page ref!");
      onScrolledToBreakpoint()
    }
  }, [onScrolledToBreakpoint, enabled])

  useEffect(() => {
    const scrollableDiv = ref.current;
    const handleScroll = async () => {
      if (scrollableDiv) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableDiv;
        if (scrollTop + clientHeight >= scrollHeight * scrolledPct && !lock) {
          setLock(true)
          await callback()
          setLock(false)
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
