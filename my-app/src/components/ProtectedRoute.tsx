import { useUserStore } from '@/Data/userstore';
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';

const ProtectedRoute = ({children} : {children : ReactNode}) => {
    const user = useUserStore(useShallow((state) => state.stored));
    if (user == undefined){
        return <Navigate to="/auth/login" replace/>
    }

  return (
    <>{children}</>
  )
}

export default ProtectedRoute