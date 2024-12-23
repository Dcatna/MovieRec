import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar} from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';
import { MovieListResult } from '@/types/MovieListResponse';
import { supabase } from '@/Data/supabase-client';
import { useQueryClient } from '@tanstack/react-query';

export interface movieBoxProp {
    movie_id : number,
    title: string,
    posterpath: string,
    item : MovieListResult,
    inList : boolean
    list_id : string | undefined
    onDelete? : (movieId: number) => void
}

const Moviebox = ({movie_id, title, posterpath, item, inList, list_id, onDelete} : movieBoxProp) => {
    const partial_url = "https://image.tmdb.org/t/p/original/"
    const client = useUserStore(useShallow((state) => state.stored));
    const [loaded, setLoaded] = useState(false)
    const queryClient = useQueryClient();

    async function handleFavorites(event: React.MouseEvent, movie_id: number, title: string, posterpath: string) {
        event.preventDefault(); // Prevent link navigation
        event.stopPropagation();
        
        const { data } = await supabase.from("favoritemovies").select("*").eq("movie_id", movie_id);
        console.log(data);
        
        if (data?.length === 0) {
            const { error } = await supabase.from("favoritemovies").insert([{
                movie_id: movie_id,
                show_id: -1, 
                user_id: client?.user_id, 
                poster_path: posterpath,
                title: title,
                overview: "",
                vote_average: 0,
            }]);
            
            if (error) {
                console.log(error, "hi");
            } else {
                // Update cache to reflect the favorite addition
                queryClient.setQueryData(['favorites', client?.user_id], (oldData: any) => {
                    // Ensure movies exists or default to an empty array
                    const updatedMovies = oldData?.movies ? [...oldData.movies, item] : [item];
                    console.log('Updating cache with movies:', updatedMovies); // Debugging log
    
                    return {
                        ...oldData,
                        movies: updatedMovies
                    };
                });
            }
        } else {
            console.log("MOVIE IS ALREADY FAVORITED");
        }
    }

    async function removeMovie(event: React.MouseEvent){
        event.preventDefault(); // Prevent link navigation
        event.stopPropagation();
        //console.log(client?.user_id, "USER", item.id, "DS", list_id)
        if (list_id != undefined) {
            const {data, error} = await supabase.from("listitem").delete().match({
                movie_id: item.id, 
                list_id: list_id,
                user_id: client?.user_id})
            if(error){
                console.log(error)
            }else {
                console.log(data);
                onDelete?.(item.id);
                queryClient.invalidateQueries(['favorites', client?.user_id]);
            }
        }else{
            const {data, error} = await supabase.from('favoritemovies').delete().match({
                movie_id: item.id,
                user_id: client?.user_id,
                show_id: -1,})

            if(error){
                console.log(error)
            }else {
                console.log(data);
                onDelete?.(item.id);
                queryClient.invalidateQueries(['favorites', client?.user_id]);
            }
        }
        
    }


    return (
        <div className="relative group">
        {loaded && (
            
            <div className="absolute top-0 right-0 m-2 z-10">
                {!inList ? 
                <button onClick={(event) => handleFavorites(event, movie_id, title, posterpath)}>
                    <FontAwesomeIcon icon={faStar} className='text-yellow-500'/>
                </button> : 
                <button onClick={(event) => removeMovie(event)}>
                    <FontAwesomeIcon icon={faStar} className='text-red-500'/>
                </button>}
                
            </div>
            
        )}
        <Link to={'/movieinfo'} state={{ item }}>
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
                    <text className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce text-white">
                        {title}
                    </text>
                )}
            </div>
        </Link>
    </div>
    
    )
}




export default Moviebox