import {Navigate, createBrowserRouter} from 'react-router-dom'
import App from '../App'
import Home from '../Pages/Home'



export const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        
        children: [
            {path: "/", element: <Navigate to = '/home' replace />},
            {path: '/home', element: <Home />}
         ]
    }
])