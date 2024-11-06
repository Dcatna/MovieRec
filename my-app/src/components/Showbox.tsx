import React from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { ShowListResult } from '@/types/MovieListResponse';
import { supabase } from '@/Data/supabase-client';
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';
import { useQueryClient } from '@tanstack/react-query';

export interface showBoxProp {
    show_id: number,
    title: string,
    posterpath: string,
    item: ShowListResult,
    inList: boolean,
    list_id: string | undefined,
    onDelete?: (movieId: number) => void
}

const Showbox = ({ show_id, title, posterpath, item, inList, list_id, onDelete }: showBoxProp) => {
    const partial_url = "https://image.tmdb.org/t/p/original/"
    const client = useUserStore(useShallow((state) => state.stored))
    const queryClient = useQueryClient();

    async function handleFavorites(event: React.MouseEvent, show_id: number, title: string, posterpath: string) {
        event.preventDefault();
        event.stopPropagation();
        
        const { data } = await supabase.from("favoritemovies").select("*").eq("show_id", show_id)
        
        if (data?.length === 0) {
            const { error } = await supabase.from("favoritemovies").insert([{
                movie_id: -1,
                show_id: show_id,
                user_id: client?.user_id,
                poster_path: posterpath,
                title: title,
                overview: "",
                vote_average: 0
            }]);

            if (error) {
                console.log(error);
            } else {
                // Update cache to reflect the favorite addition
                queryClient.setQueryData(['favorites', client?.user_id], (oldData: any) => ({
                    ...oldData,
                    shows: [...oldData.shows, item]
                }));
            }
        } else {
            console.log("SHOW IS ALREADY FAVORITED");
        }
    }

    async function removeFavorite(event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (list_id != undefined) {
            const { data, error } = await supabase.from("listitem").delete().match({
                show_id: item.id,
                user_id: client?.user_id,
                list_id: list_id
            });
            if (error) {
                console.log(error);
            } else {
                console.log(data);
                onDelete?.(item.id);
                queryClient.invalidateQueries(['favorites', client?.user_id]);
            }
        } else {
            const { data, error } = await supabase.from('favoritemovies').delete().match({
                show_id: item.id,
                user_id: client?.user_id,
                movie_id: -1,
            });

            if (error) {
                console.log(error);
            } else {
                console.log(data);
                onDelete?.(item.id);
                queryClient.invalidateQueries(['favorites', client?.user_id]);
            }
        }
    }

    return (
        <div className="group relative">
            <div className="absolute top-0 right-0 m-2 z-10">
                {!inList ? 
                    <button onClick={(event) => handleFavorites(event, show_id, title, posterpath)}>
                        <FontAwesomeIcon icon={faStar} className='text-yellow-500'/>
                    </button> : 
                    <button onClick={(event) => removeFavorite(event)}>
                        <FontAwesomeIcon icon={faStar} className='text-red-500'/>
                    </button>
                }
            </div>
            <Link to={'/showinfo'} state={{ item }}>
                <div className='relative'>
                    <img
                        className="w-full h-full rounded-md animate-in"
                        src={partial_url + item.poster_path}
                        alt="Movie Poster"
                    />
                    <div className="rounded-md absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full h-4/6"/>
                    <div className="rounded-md absolute bottom-0 left-0 h-full w-full hover:bg-gradient-to-t from-slate-900 to-transparent bg-transparent"/>
                    <text
                        className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce text-white">
                        {title ?? item.name ?? item.title ?? "No title available"}
                    </text>
                </div>
            </Link>
        </div>
    )
}

export default Showbox
