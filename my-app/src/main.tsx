import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { HomePage } from './Pages/Home';
import App from './App';
import {SignInPage, SignUpPage} from './Pages/SignIn';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {index: true, element: <Navigate to="/home" replace /> },
      {path: 'home', element: <HomePage />},
      { 
        path: "auth",
        children: [ 
          { index: true, element: <Navigate to="/auth/login" replace /> },
          {path: "login", element: <SignInPage />},
          {path: "create", element: <SignUpPage />},
        ] 
      },
    ]
  },
]);

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)