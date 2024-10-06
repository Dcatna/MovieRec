import React, {useContext, useState} from 'react'
import {MovieListResult} from "../data/types/MovieListResponse";
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBorderAll,faGripLines, faStar, fas, faCircleMinus, faMinusCircle} from '@fortawesome/free-solid-svg-icons'
import { CurrentUserContext } from '../App';
import { UserList } from '../Pages/Home';

export interface movieBoxProp {
    item : MovieListResult
    inList : boolean
    lst : UserList | undefined
    onDelete? : (movieId: number) => void
    //movie_id : string | undefined
}

const Moviebox = ({item, inList, lst, onDelete} : movieBoxProp) => {
    const partial_url = "https://image.tmdb.org/t/p/original/"
    const client = useContext(CurrentUserContext)
    const [loaded, setLoaded] = useState(false)
    async function handleFavorites(event: React.MouseEvent, item: MovieListResult) {
        event.preventDefault(); // Prevent link navigation
        event.stopPropagation();
        const {data, error} = await supabase.from("favoritemovies").select("*").eq("movie_id", item.id)
        console.log(data)
        if(data?.length == 0) {
            const {data, error} = await supabase.from("favoritemovies").insert([{
                movie_id: item.id,
                show_id : -1, 
                user_id: client?.user.id, 
                poster_path: item.poster_path,
                title: item.title,
                overview: item.overview,
                vote_average: item.vote_average,
                
                }])
    
            if(error) {
                console.log(error, "hi")
            }
            else{
                console.log(data)
            }
        }
        else{
            console.log("MOVIE IS ALREADY FAVORITED")
        }
        
    }
    async function handleDelete() {
        console.log(lst)
        if(lst != undefined) {
            const {data, error} = await supabase.from("listitem").delete().match({"list_id" : lst?.list_id, "movie_id" : item.id})
            if(error) {
                console.log(error)
            }else{
                onDelete!!(item.id)
            }
        }else{
            console.log("hi", client?.user.id, item.id)
            const {data, error} = await supabase.from("favoritemovies").delete().match({"movie_id" : item.id, "user_id" : client?.user.id, "overview" : item.overview, "show_id" : -1, "title" : item.title})
            if(error) {
                console.log(error)
            }else{
                onDelete!!(item.id)
            }
        }
    }

    return (
        <div className="relative group">
        {loaded && (
            
            <div className="absolute top-0 right-0 m-2 z-10">
                <button onClick={(event) => handleFavorites(event, item)}>
                    <FontAwesomeIcon icon={faStar} />
                </button>
                {inList && 
                    <button onClick={handleDelete}> 
                        <FontAwesomeIcon icon={faMinusCircle} className='text-red-500'/>
                    </button> }
            </div>
            
        )}
        <Link to={'/info'} state={{ item }}>
            <div className="relative">
                <img
                    onLoad={() => { setLoaded(true) }}
                    className="w-full h-full rounded-md animate-in"
                    src={partial_url + item.poster_path}
                    alt="Movie Poster"
                />
                <div className="rounded-md absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full h-4/6"/>
                <div className="rounded-md absolute bottom-0 left-0 h-full w-full hover:bg-gradient-to-t from-slate-900 to-transparent bg-transparent"/>
                {loaded && (
                    <text className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce">
                        {item.title}
                    </text>
                )}
            </div>
        </Link>
    </div>
    
    )
}




export default Moviebox