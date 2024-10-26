import React from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar} from '@fortawesome/free-solid-svg-icons'
import { ShowListResult } from '@/types/MovieListResponse';
import { supabase } from '@/Data/supabase-client';
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';

export interface showBoxProp {
    show_id : number,
    title: string,
    posterpath: string
    item : ShowListResult
    //movie_id : string | undefined
}

const Showbox = ({show_id, title, posterpath, item} : showBoxProp) => {
    const partial_url = "https://image.tmdb.org/t/p/original/"
    const client = useUserStore(useShallow((state) => state.stored))

    async function handleFavorites(event: React.MouseEvent, show_id : number, title: string, posterpath: string) {
        event.preventDefault(); // Prevent link navigation
        event.stopPropagation();
        const {data} = await supabase.from("favoritemovies").select("*").eq("show_id", show_id)
        console.log(data)
        if(data?.length == 0) {
            const {data, error} = await supabase.from("favoritemovies").insert([{
                movie_id: -1,
                show_id : show_id, 
                user_id: client?.user_id, 
                poster_path: posterpath,
                title: title,
                overview: "",
                vote_average: 0 
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
    console.log(title, item.name, item.title,"NAMES", item)

    return (
        
        
            <div className="group relative">
            <div className="absolute top-0 right-0 m-2 z-10">
                <button onClick={(event) => handleFavorites(event, show_id, title, posterpath)}>
                    <FontAwesomeIcon icon={faStar} />
                </button>
                
            </div>
            <Link to={'/showinfo'} state={{item}}>
            <div className='relative'>
                <img
                    className="w-full h-full rounded-md animate-in"
                    src={partial_url + posterpath}
                    alt="Movie Poster"
                />
                <div className="rounded-md absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full h-4/6"/>
                <div className="rounded-md absolute bottom-0 left-0 h-full w-full hover:bg-gradient-to-t from-slate-900 to-transparent bg-transparent"/>
                <text
                    className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce text-white">
                    {item.title}
                </text>
            </div>
            </Link>
            </div>
         
    )
}

export default Showbox