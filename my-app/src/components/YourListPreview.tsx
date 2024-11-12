import { contentFrom, deleteListById, ListWithPostersRpcResponse, selectListByID, selectListByListIDwithPoster, selectListsByIdsWithPoster, supabase } from '@/Data/supabase-client';
import TMDBCClient from '@/Data/TMDB-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react'
import { useRefresh } from './RefreshContext';
import { MovieListResult } from '@/types/MovieListResponse';
import { ShowDetailResponse } from '@/types/types';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Moviebox from './Moviebox';
import { ImageGrid } from './poster-item';
import Showbox from './Showbox';
import defualtlist from './movieicon.png';
import { ListItem, ListWithItems, useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';

export function useStateProducer<T extends any>(
    defaultValue: T,
    producer: (update: (value: T) => void) => Promise<void>,
    keys: ReadonlyArray<unknown>,
  ): T {
    
    const [value, setValue] = useState(defaultValue)
    
    useEffect(() => { 
       producer(setValue).catch()
    }, keys)
  
    return value
  }

const YourListPreview = () => {
    const params = useParams();
    const user = useUserStore(useShallow((state) => state.stored));
    const { setShouldRefresh } = useRefresh();
    const client = new TMDBCClient();
    const queryClient = useQueryClient(); 
    const listId = params['listId'];
    const location = useLocation();
    const [trig, setTrig] = useState(0)

    const listpassed = useStateProducer<ListWithItems | undefined >(undefined, async (update) => {
        const res : ListWithItems = (await supabase
            .from("userlist")
            .select("*, listitem(*)")
            .eq("list_id", listId)
            .single()).data as ListWithItems;
        
            update(res)
    }, [listId, location.pathname, trig]);

    const lst = listpassed?.listitem??[]

    const navigate = useNavigate();
    
    async function handleDelete(){
        const res = await deleteListById(listId)
        if(res === 0) {
            queryClient.invalidateQueries(['user_lists', user?.user_id]);
            navigate("/home")
        }
    }



    // const refetchListData = async () => {
    //     const updatedLst = await selectListByListIDwithPoster(listId);
    //     setLst(updatedLst);
        
    //     const newUrl = updatedLst.ids[0]?.split(',').find(part => part.startsWith("https")) || defualtlist;
    //     setMainPosterUrl(newUrl);
    // };
    
    const handleDeleteMovies = async (deletedMovieId: number) => {
        setTrig(p => p+1)
    };
    
    const handleDeleteShows = async (deletedShowId: number) => {
        setTrig(p => p+1)
    }

    const listimages = lst.slice(0, 4)
    console.log(listimages, "IMAGES")

    
  return (
    <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto relative">
        <div className="flex items-center justify-between w-full mb-8">
            <div className="relative w-40 h-40 flex-shrink-0">
                {(listimages?.length??0) > 3 ? (

                     <ImageGrid images={listimages.map((it) => it.poster_path)} />
                     
                ) : (
                    <img
                        src={listimages[0]?.poster_path??defualtlist}
                        alt=""
                        className="w-full h-full object-cover rounded-md shadow-lg"
                        
                    />
                )}
            </div>

            <div className="ml-8 flex flex-col justify-between flex-grow">
                <p className="text-5xl font-bold text-gray-800 mb-2">
                    {listpassed?.name}
                </p>
                <p className="text-xl text-gray-500 mb-4">
                    Created by {listpassed?.user_id} - {lst?.length} items
                </p>
            </div>
            <button
                className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-200 text-black rounded-md p-2 shadow-sm focus:outline-none"
                onClick={handleDelete}
            >
                Delete List
            </button>
        </div>

        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 w-full">
        {lst
            .filter((listitem) => listitem.movie_id !== -1)
            .map((listitem) => (
                <div key={listitem.movie_id} className="flex flex-col items-center">
                <Moviebox
                    item={listitem}
                    movie_id={listitem.movie_id}
                    title={listitem.title}
                    posterpath={listitem.poster_path}
                    inList={true}
                    list_id={listId}
                    onDelete={handleDeleteMovies}
                />
                </div>
            ))}
            {lst
            .filter((listitem) => listitem.show_id !== -1)
            .map((listitem) => (
                <div key={listitem.show_id} className="flex flex-col items-center">
                <Showbox
                    item={listitem as ShowDetailResponse}
                    show_id={listitem.show_id}
                    title={listitem.title}
                    posterpath={listitem.poster_path}
                    inList={true}
                    list_id={listId}
                    onDelete={handleDeleteShows}
                />
                </div>
            ))}
        </div>
    </div>


  )
}

export default YourListPreview