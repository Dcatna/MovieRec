import { Outlet } from "react-router-dom";
import { useUserStore } from "./Data/userstore";
import { useEffect, useRef } from "react";
import { AppSidebar } from "./components/sidebar";
import { ScrollProvider } from "./ScrollContext";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { useShallow } from "zustand/shallow";

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
    <SidebarProvider
      style={{
        // @ts-ignore
        "--sidebar-width": "30rem",
        "--sidebar-width-mobile": "20rem",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 absolute top-0 z-20">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
          </div>
        </header>
        <ScrollProvider provideRef={scrollAreaRef}>
          <div
            ref={scrollAreaRef}
            className="grid max-h-screen overflow-y-auto overflow-x-hidden p-x scroll-mt-16"
          >
            <Outlet />
          </div>
        </ScrollProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
