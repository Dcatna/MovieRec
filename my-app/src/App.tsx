import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useUserStore } from "./Data/userstore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Sidebar } from "./components/sidebar";
import Navbar from "./components/Navbar";

const ScrollContext = createContext<{
  ref: React.RefObject<HTMLDivElement>;
  toTop: () => void;
} | null>(null);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within a ScrollProvider");
  }
  return context;
};

const ScrollProvider: React.FC<{
  provideRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}> = ({ children, provideRef }) => {
  const scrollToTop = useCallback(
    (duration: number) => {
      const scrollArea = provideRef.current; // Access the current scroll area ref
      if (!scrollArea) return;

      const start = scrollArea.scrollTop; // Get the current scroll position
      const startTime = performance.now(); // Get the current time

      const scrollAnimation = (currentTime: number) => {
        const timeElapsed = currentTime - startTime; // Calculate elapsed time
        const progress = Math.min(timeElapsed / duration, 1); // Normalize progress

        // Easing function (optional): easeInOutQuad
        const easeInOutQuad = (t: number) => {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        const easeProgress = easeInOutQuad(progress); // Apply easing function
        scrollArea.scrollTop = start * (1 - easeProgress); // Scroll to the new position

        if (progress < 1) {
          requestAnimationFrame(scrollAnimation); // Continue the animation
        }
      };

      requestAnimationFrame(scrollAnimation); // Start the animation
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

function App() {
  const user = useUserStore(useShallow((state) => state.stored));
  const signOut = useUserStore((state) => state.signOut);
  const refreshUser = useUserStore((state) => state.refreshUser);
  const refreshPlaylists = useUserStore((state) => state.refreshPlaylists);
  const playlists = useUserStore(useShallow((state) => state.playlists));
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refreshUser();
    refreshPlaylists();

    console.log(user);
  }, []);

  return (
    <div className="bg-background max-h-screen flex flex-col">

      <div className="sticky top-0 h-64 z-20 backdrop-blur-md bg-background/50">
        <Navbar />
      </div>

      <div className="grid grid-cols-5 flex-grow min-h-0 overflow-hidden">
        <div className="hidden lg:block max-h-screen">
          <Sidebar
            signOut={signOut}
            user={user}
            refreshPlaylist={refreshPlaylists}
            playlists={playlists}
            onDeletePlaylist={() => {}}
            className="max-h-screen min-h-screen"
          />
        </div>

        <div className="col-span-full lg:col-span-4 lg:border-l flex flex-col overflow-y-auto overflow-x-hidden max-w-screen">
          <div
            ref={scrollAreaRef}
            className="flex flex-col overflow-y-auto overflow-x-hidden"
          >
            

            <div className="flex-grow">
              <ScrollProvider provideRef={scrollAreaRef}>
                <Outlet />
              </ScrollProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
