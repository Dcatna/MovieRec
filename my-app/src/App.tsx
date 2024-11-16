import { Outlet, useNavigate } from "react-router-dom";
import { useUserStore } from "./Data/userstore";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppSidebar } from "./components/sidebar";
import { ScrollProvider } from "./ScrollContext";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./components/ui/sidebar";
import { useShallow } from "zustand/shallow";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Separator } from "./components/ui/separator";
import { Button } from "./components/ui/button";
import {
  ChevronRight,
  HomeIcon,
  icons,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react";
import { supabaseSignOut } from "./Data/supabase-client";
import debounce from "lodash.debounce";

function SearchBar() {
  const [text, setText] = useState("");
  const navigate = useNavigate();

    const handleSearch = useCallback(
      debounce((query) => {
        if (query.trim()) {
          navigate(`/search?query=${encodeURIComponent(query.trim())}`);
        }
      }, 300),
      [navigate]
    );
  
    const handleInputChange = (e) => {
      const value = e.target.value;
      setText(value); 
      handleSearch(value);
    };
  return (
    <form
      className="flex flex-row w-full max-w-lg rounded-full h-fit backdrop-brightness-75 items-center space-x-1"
      onSubmit={(e) => e.preventDefault()}
    >
      <Input
        value={text}
        onChange={handleInputChange}
        className="font-semibold bg-transparent border-none outline-none focus:outline-none rounded-full"
        placeholder="Search..."
      />
      <Separator
        orientation="vertical"
        className="h-6 bg-foreground"
      ></Separator>
      <SearchIcon />
    </form>
  );
}

function App() {
  const subscribe = useUserStore(useShallow((state) => state.init));
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const user = useUserStore((state) => state.userdata)
  const navigate = useNavigate()
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SidebarProvider className="max-h-screen overflow-hidden">
      <AppSidebar variant="inset" collapsible="icon" />
      <div className="flex flex-col max-h-screen w-full">
        <div className="flex flex-row items-center justify-between h-[calc(12vh)] w-full z-50">
          <div className="flex items-center">
            <SidebarTrigger />
            <ExpandSidebarArrow />
          </div>

    <div className="flex items-center justify-center flex-grow max-w-lg w-full p-8">
      <SearchBar />
    </div>
    <div className="flex items-center space-x-4 mr-2">
      <Button size="icon" variant="default" className="rounded-full" onClick={() => navigate('/home')}>
        <HomeIcon />
      </Button>
      <Button size="lg" variant="default" className="rounded-full" onClick={() => navigate("/profile")}>
        Profile
      </Button>
      {user ? 
      <Button size="lg" variant="default" className="rounded-full" onClick={() => supabaseSignOut()}>
        Sign Out
      </Button> :
      <Button size="lg" variant="default" className="rounded-full" onClick={() => navigate("/auth/login")}>
        Sign In
      </Button>
      }
    </div>
  </div>
  <SidebarInset className="overflow-hidden">
    <ScrollProvider provideRef={scrollAreaRef}>
      <Card className="bg-slate-50 w-full">
        <div
          ref={scrollAreaRef}
          className="max-h-[calc(88vh)] overflow-y-auto overflow-x-hidden"
        >
          <Outlet />
        </div>
      </Card>
    </ScrollProvider>
  </SidebarInset>
</div>

    </SidebarProvider>
  );
}

function ExpandSidebarArrow() {
  const {state, setState} = useSidebar();

  return (
    <Button size={"icon"} onClick={() => setState(state === "extra" ? "expanded" : "extra") }variant={"default"} className="rounded-full">
      <ChevronRight />
    </Button>
  );
}

export default App;
