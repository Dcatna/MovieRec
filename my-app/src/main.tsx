import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { HomePage } from "./Pages/Home";
import App from "./App";
import { SignInPage, SignUpPage } from "./Pages/SignIn";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchPage from "./Pages/Search";
import BrowsePage from "./Pages/Browse";
import MovieInfo, { ShowInfo } from "./Pages/Movie-Show-Infor";
import Recommendations from "./Pages/Recommendations";
import CommentsPage from "./Pages/CommentsPage";
import ListViewPage from "./Pages/ListViewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./Pages/ProfilePage";
import { selectListByIdWithItems } from "./Data/supabase-client";
import FavortiesPage from "./components/FavoritesPreview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <HomePage /> },
      {
        path: "search",
        children: [
          { index: true, element: <Navigate to="/search/movie"/> },
          { path: "movie", element: <SearchPage searchState={"movie"} /> },
          { path: "show", element: <SearchPage searchState={"tv"} /> }
        ],
      },
      {
        path: "auth",
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          { path: "login", element: <SignInPage /> },
          { path: "create", element: <SignUpPage /> },
        ],
      },
      {
        path: 'browse',  
        children: [
          { index: true, element: <Navigate to="/browse/movie"/> },
          { path: "movie", element: <BrowsePage searchState="movie"/> },
          { path: "show", element: <BrowsePage searchState="tv"/> }
        ],
      },
      {
        path: 'recommended', element: <ProtectedRoute><Recommendations/></ProtectedRoute>
      },
      {
        path: "movie/:id", 
        element: <MovieInfo/>, 
        children: [
          {
            path:"comments", element: <CommentsPage/>
          }
        ]
      },
      {
        path: "show/:id", 
        element: <ShowInfo/>, 
        children: [
          {
            path:"comments", element: <CommentsPage/>
          }
        ]
      },
      {
        path:"list/:listId", element: <ListViewPage/>, loader: async (params) => {
          const data = await selectListByIdWithItems(params['listId'] ?? "")
          if (data.ok) {
            return data.data
          } else {
            return null
          }
        }
      },
      {
        path: "favorites", element: <FavortiesPage/>
      },
      {
        path:"profile", element: <ProtectedRoute><ProfilePage/></ProtectedRoute>
      },
      {
        path:"profile/:userid/favorites", element: <FavortiesPage/>
      },
      {
        path:"profile/:userid", element: <ProfilePage/>
      },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
