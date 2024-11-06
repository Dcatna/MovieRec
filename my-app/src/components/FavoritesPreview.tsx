import { getFavoritedMoviesByUser, getFavoritedShowsByUser } from '@/Data/supabase-client';
import TMDBCClient from '@/Data/TMDB-fetch';
import { useUserStore } from '@/Data/userstore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';
import { useRefresh } from './RefreshContext';
import { MovieListResult } from '@/types/MovieListResponse';
import { ShowDetailResponse } from '@/types/types';
import Moviebox from './Moviebox';
import default_favs from './default_favorite_list.jpg';
import Showbox from './Showbox';

const FavoritesPreview = () => {
    const user = useUserStore(useShallow((state) => state.stored));
    const { setShouldRefresh } = useRefresh();
    const client = new TMDBCClient();
    const queryClient = useQueryClient(); // Initialize queryClient here

    // Fetch favorites using useQuery
    const { data, isLoading } = useQuery(
        ['favorites', user?.user_id],
        async () => {
            const favoriteMovies = await getFavoritedMoviesByUser();
            const favoriteShows = await getFavoritedShowsByUser();
            const fetchedMovies = await Promise.all(favoriteMovies.map(item => client.fetchMovieByID(item.movie_id)));
            const fetchedShows = await Promise.all(favoriteShows.map(item => client.fetchShowByID(item.show_id)));
            return { movies: fetchedMovies, shows: fetchedShows };
        },
        {
            staleTime: 1000 * 60 * 5,
            cacheTime: 1000 * 60 * 10,
            retry: 1,
        }
    );

    const handleDeleteMovies = (deletedMovieId: number) => {
        if (data?.movies) {
            const updatedMovies = data.movies.filter(movie => movie.id !== deletedMovieId);
            setShouldRefresh(true);
            // Update the cache manually with type casting
            queryClient.setQueryData(['favorites', user?.user_id], (old) => ({
                ...(old as { movies: MovieListResult[], shows: ShowDetailResponse[] }),
                movies: updatedMovies
            }));
        }
    };
    
    const handleDeleteShows = (deletedShowId: number) => {
        if (data?.shows) {
            const updatedShows = data.shows.filter(show => show.id !== deletedShowId);
            setShouldRefresh(true);
            // Update the cache manually with type casting
            queryClient.setQueryData(['favorites', user?.user_id], (old) => ({
                ...(old as { movies: MovieListResult[], shows: ShowDetailResponse[] }),
                shows: updatedShows
            }));
        }
    };
    

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const movies = data?.movies || [];
    const shows = data?.shows || [];

    return (
        <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto">
            <div className="flex items-center justify-between w-full mb-8">
                <div className="w-40 h-40 flex-shrink-0 relative">
                    <img src={default_favs} className="w-full h-full object-cover rounded-md shadow-lg" />  
                </div>

                <div className="ml-8 flex flex-col justify-between flex-grow">
                    <p className="text-5xl font-bold text-gray-800 mb-2">
                        Favorites
                    </p>
                    <p className="text-xl text-gray-500 mb-4">
                        Created by {user?.username} - {movies.length + shows.length} items
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
                            list_id={undefined}
                            onDelete={handleDeleteMovies}
                        />
                    </div>
                ))}
                {shows.map((show: ShowDetailResponse) => {
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
                                list_id={undefined}
                                onDelete={handleDeleteShows}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FavoritesPreview;
