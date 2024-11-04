import { contentFrom, getFavoritedMoviesByUser, getFavoritedShowsByUser, ListWithPostersRpcResponse, selectListByID, selectListsByUserId } from '@/Data/supabase-client';
import TMDBCClient from '@/Data/TMDB-fetch';
import { MovieListResult } from '@/types/MovieListResponse';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ImageGrid } from './poster-item';
import defualtlist from './movieicon.png';
import Moviebox from './Moviebox';
import Showbox from './Showbox';
import { ShowDetailResponse } from '@/types/types';
import default_favs from './default_favorite_list.jpg';
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';
import { useRefresh } from './RefreshContext';

const ListPreview = () => {
    const params = useParams();
    const user = useUserStore(useShallow((state) => state.stored));
    const listId = params['listId'];
    const location = useLocation();
    const lst: ListWithPostersRpcResponse | undefined = location.state?.item;
    const { setShouldRefresh } = useRefresh();
    const client = new TMDBCClient();

    // State to hold movies and shows
    const [movies, setMovies] = useState<MovieListResult[]>([]);
    const [shows, setShows] = useState<ShowDetailResponse[]>([]);
    const [mainPosterUrl, setMainPosterUrl] = useState(defualtlist);
    const [userList, setUserList] = useState<boolean>(false);

    // Check if the list belongs to the user
    useQuery(['userLists', user?.user_id], async () => {
        if (user?.user_id) {
            return await selectListsByUserId(user.user_id);
        }
        return [];
    }, {
        onSuccess: (lists) => {
            setUserList(lists?.some(list => list.list_id === lst?.list_id) || false);
        }
    });

    // Fetch favorites if `lst` is undefined
    useQuery(
        ['favorites', user?.user_id],
        async () => {
            const favoriteMovies = await getFavoritedMoviesByUser();
            const favoriteShows = await getFavoritedShowsByUser();
            const fetchedMovies = await Promise.all(favoriteMovies.map(item => client.fetchMovieByID(item.movie_id)));
            const fetchedShows = await Promise.all(favoriteShows.map(item => client.fetchShowByID(item.show_id)));
            return { movies: fetchedMovies, shows: fetchedShows };
        },
        {
            enabled: !lst, // Only fetch when `lst` is undefined
            onSuccess: (data) => {
                setMovies(data.movies);
                setShows(data.shows);
            }
        }
    );

    // Fetch list items if `lst` is defined
    useQuery(
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
            return { movies: fetchedMovies, shows: fetchedShows };
        },
        {
            enabled: !!lst, // Only fetch when `lst` is defined
            onSuccess: (data) => {
                setMovies(data.movies);
                setShows(data.shows);
            }
        }
    );

    useEffect(() => {
        // Determine main poster URL for list preview if `lst` is defined
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
    }, [lst]);

    const handleDeleteMovies = (deletedMovieId: number) => {
        setMovies(currentMovies => currentMovies.filter(movie => movie.id !== deletedMovieId));
        setShouldRefresh(true);
    };

    const handleDeleteShows = (deletedShowId: number) => {
        setShows(currentShows => currentShows.filter(show => show.id !== deletedShowId));
        setShouldRefresh(true);
    };

    return (
        <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto">
            <div className="flex items-center justify-between w-full mb-8">
                <div className="w-40 h-40 flex-shrink-0 relative">
                    {!lst ? (
                        <img src={default_favs} className="w-full h-full object-cover rounded-md shadow-lg" />
                    ) : lst.ids && lst.ids.length > 3 ? (
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
                        Created by {lst == undefined ? user?.username : lst.username ? lst.username : "Undefined"} - {movies.length + shows.length} items
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
                            inList={userList}
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
                                inList={userList}
                                list_id={listIdToUse}
                                onDelete={handleDeleteShows}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListPreview;
