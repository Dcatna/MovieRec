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
import MovieInfo from "./components/MovieInfo";
import ShowInfo from "./components/ShowInfo";
import Recommendations from "./Pages/Recommendations";
import CommentsPage from "./components/CommentsPage";
import FavoritesPreview from "./components/FavoritesPreview";
import YourListPreview from "./components/YourListPreview";
import OtherListPreview from "./components/OtherListPreview";
import ProtectedRoute from "./components/ProtectedRoute";
import YourProfileScreen from "./components/YourProfileScreen";
import OtherProfileScreen from "./components/OtherProfileScreen";

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
          { path: "movie", element: <SearchPage /> },
          { path: "show", element: <SearchPage /> }
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
        path: 'browse', element: <BrowsePage/>
      },
      {
        path: 'recommended', element: <ProtectedRoute><Recommendations/></ProtectedRoute>
      },
      {
        path: "movieinfo", element: <MovieInfo/>
      },
      {
        path: "showinfo", element: <ShowInfo/>
      },
      {
        path:"home/ulist/:listId", element: <YourListPreview/>
      },
      {
        path:"home/list/:listId", element: <OtherListPreview/>
      },
      {
        path:"home/ulist/favorites", element: <FavoritesPreview/>
      },
      {
        path:"movieinfo/:movieId/comments", element: <CommentsPage/>
      },
      {
        path:"showinfo/:showId/comments", element: <CommentsPage/>
      },
      {
        path:"profile", element: <ProtectedRoute><YourProfileScreen/></ProtectedRoute>
      },
      {
        path:"profile/:username", element: <OtherProfileScreen/>
      }
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
