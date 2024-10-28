import {
  createContext,
  useCallback,
  useContext,
  RefObject,
} from "react";

// Define the context shape
export const ScrollContext = createContext<{
  ref: RefObject<HTMLDivElement>;
  toTop: () => void;
} | null>(null);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
      throw new Error("useScrollContext must be used within a ScrollProvider");
  }
  return context;
};
// Custom hook to access the ScrollContext
interface ScrollProviderProps {
  provideRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ provideRef, children }) => {
  const scrollToTop = useCallback(
    (duration: number) => {
      const scrollArea = provideRef.current;
      if (!scrollArea) return;

      const start = scrollArea.scrollTop;
      const startTime = performance.now();

      const scrollAnimation = (currentTime: number) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        const easeInOutQuad = (t: number) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const easeProgress = easeInOutQuad(progress);
        scrollArea.scrollTop = start * (1 - easeProgress);

        if (progress < 1) {
          requestAnimationFrame(scrollAnimation);
        }
      };

      requestAnimationFrame(scrollAnimation);
    },
    [provideRef]
  );

  return (
    <ScrollContext.Provider
      value={{
        ref: provideRef,
        toTop: () => scrollToTop(400),
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
