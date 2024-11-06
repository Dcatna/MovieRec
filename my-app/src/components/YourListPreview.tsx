import { contentFrom, ListWithPostersRpcResponse, selectListByID} from '@/Data/supabase-client';
import TMDBCClient from '@/Data/TMDB-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react'
import { useRefresh } from './RefreshContext';
import { MovieListResult } from '@/types/MovieListResponse';
import { ShowDetailResponse } from '@/types/types';
import { useLocation, useParams } from 'react-router-dom';
import Moviebox from './Moviebox';
import { ImageGrid } from './poster-item';
import Showbox from './Showbox';
import defualtlist from './movieicon.png';

const YourListPreview = () => {
    const params = useParams();
    //const user = useUserStore(useShallow((state) => state.stored));
    const { setShouldRefresh } = useRefresh();
    const client = new TMDBCClient();
    const queryClient = useQueryClient(); 
    const [movies, setMovies] = useState<MovieListResult[]>([]);
    const [shows, setShows] = useState<ShowDetailResponse[]>([]);
    const listId = params['listId'];
    const location = useLocation();
    const lst: ListWithPostersRpcResponse | undefined = location.state?.item;
    const [mainPosterUrl, setMainPosterUrl] = useState(defualtlist);


    
    const { data , isLoading } = useQuery(
        ['listItems', lst?.list_id],
        async () => {
            const listItem = await selectListByID(lst!.list_id);
            const fetchedMovies = [];
            const fetchedShows = [];

            for (const item of listItem) {
                if (item.movie_id === -1 && item.show_id) {
                    const showres = await client.fetchShowByID(item.show_id);
                    fetchedShows.push(showres);
                } else if (item.movie_id) {
                    const movieres = await client.fetchMovieByID(item.movie_id);
                    fetchedMovies.push(movieres);
                }
            }
            return { movies: fetchedMovies as MovieListResult[], shows: fetchedShows as ShowDetailResponse[]};
        },
        {
            enabled: !!lst,
            onSuccess: (data) => {
                setMovies(data.movies);
                setShows(data.shows);
            }
        }
    )

    useEffect(() => {
        if (lst) {
            const extractUrl = () => {
                if (lst.ids && lst.ids.length > 0) {
                    const components = lst.ids[0].split(',');
                    const url = components.find(part => part.startsWith("https"));
                    setMainPosterUrl(url || defualtlist);
                }
            };
            extractUrl();
        }
    }, [lst])
    
    const handleDeleteMovies = (deletedMovieId: number) => {
        if (data?.movies) {
            const updatedMovies = data.movies.filter(movie => movie.id !== deletedMovieId);
            setMovies(updatedMovies); // Update state directly for immediate UI change
    
            // Update the cache manually with the correct cache key
            queryClient.setQueryData(['listItems', lst?.list_id], (old) => ({
                ...(old as { movies: MovieListResult[], shows: ShowDetailResponse[] }),
                movies: updatedMovies
            }));
            setShouldRefresh(true);
        }
    };
    
    const handleDeleteShows = (deletedShowId: number) => {
        if (data?.shows) {
            const updatedShows = data.shows.filter(show => show.id !== deletedShowId);
            setShows(updatedShows); // Update state directly for immediate UI change
    
            // Update the cache manually with the correct cache key
            queryClient.setQueryData(['listItems', lst?.list_id], (old) => ({
                ...(old as { movies: MovieListResult[], shows: ShowDetailResponse[] }),
                shows: updatedShows
            }));
            setShouldRefresh(true);
        }
    };
    

    if (isLoading) {
        return <div>Loading...</div>;
    }

    
  return (
    <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto">
            <div className="flex items-center justify-between w-full mb-8">
                <div className="w-40 h-40 flex-shrink-0 relative">
                    {lst.ids && lst.ids.length > 3 ? (
                        <ImageGrid images={contentFrom(lst).map((it) => it.url)} />
                    ) : lst.ids && lst.ids.length < 4 && lst.ids[0] ? (
                        <img
                            src={mainPosterUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-md shadow-lg"
                        />
                    ) : (
                        <img src={defualtlist} className="w-full h-full object-cover rounded-md shadow-lg" />
                    )}
                </div>

                <div className="ml-8 flex flex-col justify-between flex-grow">
                    <p className="text-5xl font-bold text-gray-800 mb-2">
                        {lst == undefined ? "Favorites" : lst.name ? lst.name : "Undefined List"}
                    </p>
                    <p className="text-xl text-gray-500 mb-4">
                        Created by {lst.username ? lst.username : "Undefined"} - {movies.length + shows.length} items
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 w-full">
                {movies.map((movie: MovieListResult) => (
                    <div key={movie.id} className="flex flex-col items-center">
                        <Moviebox
                            item={movie}
                            movie_id={movie.id}
                            title={movie.title}
                            posterpath={movie.poster_path}
                            inList={true}
                            list_id={listId}
                            onDelete={handleDeleteMovies}
                        />
                    </div>
                ))}
                {shows.map((show: ShowDetailResponse) => {
                    const listIdToUse = lst ? listId : undefined;
                    const mappedShow = {
                        ...show,
                        title: show.name || "",
                        genre_ids: show.genres ? show.genres.map((genre) => genre.id) : []
                    };

                    return (
                        <div key={show.id} className="flex flex-col items-center">
                            <Showbox
                                item={mappedShow}
                                show_id={mappedShow.id}
                                title={mappedShow.title}
                                posterpath={mappedShow.poster_path}
                                inList={true}
                                list_id={listIdToUse}
                                onDelete={handleDeleteShows}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
  )
}

export default YourListPreview