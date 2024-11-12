import { Outlet } from "react-router-dom";
import { useUserStore } from "./Data/userstore";
import { useEffect, useRef } from "react";
import { Sidebar } from "./components/sidebar";
import Navbar from "./components/Navbar";
import { RefreshProvider } from "./components/RefreshContext";
import { ScrollProvider } from "./ScrollContext";
import { cn } from "./lib/utils";

function App() {
  const subscribe = useUserStore(state => state.init)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe()
    return () => {
      unsubscribe()
    }
  }, []);

  return (
    <RefreshProvider>
      <div className="bg-background max-h-screen overflow-hidden flex flex-col">
        <Navbar />
        <div className="grid lg:grid-cols-5">
          <Sidebar
            className="hidden lg:block max-h-screen overflow-hidden"
          />
          <div
            className={cn(`col-span-3 lg:col-span-4 lg:border-l`,"max-h-[calc(100vh)]")}
          >
            <div
              ref={scrollAreaRef}
              className={`h-full overflow-y-auto overflow-x-hidden`}
            >
              <ScrollProvider provideRef={scrollAreaRef}>
                <Outlet />
              </ScrollProvider>
            </div>
          </div>
        </div>
      </div>
    </RefreshProvider>
  );
}

export default App;
