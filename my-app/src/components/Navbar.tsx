
import { Link } from 'react-router-dom'
import {Button} from "../components/ui/button";
import { faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUserStore } from '@/Data/userstore';

const Navbar = () => {
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