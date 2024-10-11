
import { Link, useNavigate } from 'react-router-dom'
import {Button} from "../components/ui/button";
import { faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';

const Navbar = () => {
    const signOut = useUserStore((state) => state.signOut);
    const navigate = useNavigate()

    const user = useUserStore(useShallow((state) => state.stored));
    console.log("USERRRR", user?.user_id)

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
            <Button variant="ghost" className="rounded-md">
                <Link to = "/profile">Profile</Link>
            </Button>
            {user?.user_id == null ? <Button onClick={() => navigate("auth")} className='rounded-md' variant="ghost">
                Sign In
            </Button>  :
            <Button onClick={signOut} variant="ghost" className="rounded-md">
                Sign Out
            </Button> 
            }
            <Link to={"/search"}><FontAwesomeIcon icon = {faMagnifyingGlass} /></Link>
        </div>
    </nav>
  )
}

export default Navbar