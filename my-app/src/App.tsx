import { Outlet } from "react-router-dom";
import { useUserStore } from "./Data/userstore";
import { useEffect, useRef, useState } from "react";
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

function SearchBar() {
  const [text, setText] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-row w-full max-w-lg rounded-full h-fit backdrop-brightness-75 items-center space-x-1"
    >
      <Input
        value={text}
        className="font-semibold bg-transparent border-none outline-none focus:outline-none rounded-full"
        placeholder="Search..."
        onInput={(e: any) => setText(e.target.value)}
      />
      <Separator
        orientation="vertical"
        className="h-6 bg-foreground"
      ></Separator>
      <Button
        className="bg-transparent hover:bg-transparent hover:outline-none pe-4"
        size="icon"
        type="submit" // Set type to "submit" to trigger form submission
        variant="link"
      >
        <SearchIcon />
      </Button>
    </form>
  );
}

function App() {
  const subscribe = useUserStore(useShallow((state) => state.init));
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

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
        <div className="flex flex-row items-center justify-start max-h-[calc(12vh)]">
          <SidebarTrigger></SidebarTrigger>
          <ExpandSidebarArrow></ExpandSidebarArrow>
          <div className="max-w-lg w-full p-8">
            <SearchBar></SearchBar>
          </div>
          <Button size={"icon"} variant={"default"} className="rounded-full">
            <HomeIcon></HomeIcon>
          </Button>
          <Button
            size={"icon"}
            variant={"default"}
            className="rounded-full ms-12"
          >
            <PlusCircleIcon />
          </Button>
          <Button
            size={"lg"}
            variant={"default"}
            className="rounded-full ms-12"
          >
            Sign Out
          </Button>
        </div>
        <SidebarInset className="overflow-hidden">
          <ScrollProvider provideRef={scrollAreaRef}>
            <Card className="bg-slate-50 w-full">
              <div
                ref={scrollAreaRef}
                className="grid grid-cols-1 max-h-[calc(88vh)] overflow-y-auto overflow-x-hidden my-4"
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
