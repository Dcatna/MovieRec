
import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {Button} from "../components/ui/button";
import { faBorderAll,faGripLines, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabaseSignOut } from '../Data/supabase-client';
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';


type Props = {}

const Navbar = (props: Props) => {
    const signOut = useUserStore((state) => state.signOut);
    

  return (
    <nav>
        <div className="w-screen flex justify-center items-center bg-transparent">
            <Button asChild variant="ghost">
                <Link to="/home">Home</Link>
            </Button>
            <Button asChild variant="ghost">
                <Link to="/browse">Browse</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-md">
                <Link to="/recommended">Recommended</Link>
            </Button>
            <Button  asChild variant="ghost" className="rounded-md">
                <Link to= "/pool">Pool</Link>
            </Button>
            <Button variant="ghost" className="rounded-md">
                <Link to = "/profile">Profile</Link>
            </Button>
            <Button onClick={signOut} variant="ghost" className="rounded-md">
                Sign Out
            </Button>
            <Link to={"/search"}><FontAwesomeIcon icon = {faMagnifyingGlass} /></Link>
        </div>
    </nav>
  )
}

export default Navbar