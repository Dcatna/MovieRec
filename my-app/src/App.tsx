import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useUserStore } from "./Data/userstore";
import { useEffect, useRef } from "react";
import { Sidebar } from "./components/sidebar";
import Navbar from "./components/Navbar";
import { RefreshProvider } from "./components/RefreshContext";
import { ScrollProvider } from "./ScrollContext";


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
  }, [refreshUser, refreshPlaylists]);

  return (
    <RefreshProvider>
    <div className="bg-background min-h-screen flex flex-col overflow-x-hidden">

      <div className="sticky top-0 h-16 z-20 ">
        <Navbar />
      </div>

      <div className="grid grid-cols-5 flex-grow min-h-0 ">
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
    </RefreshProvider>
  );
}

export default App;
