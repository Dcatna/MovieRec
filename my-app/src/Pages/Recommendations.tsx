import Moviebox from "@/components/Moviebox";
import Showbox from "@/components/Showbox";
import {
    getRecentMovieFavorites,
    getRecentShowFavorites,
} from "@/Data/supabase-client";
import TMDBCClient from "@/Data/TMDB-fetch";
import { MovieListResult, ShowListResult } from "@/types/MovieListResponse";
import { ShowDetailResponse } from "@/types/types";
import { useEffect, useState, useRef } from "react";

const Recommendations = () => {
    const [favoriteMovies, setFavoriteMovies] = useState<MovieListResult[]>([]);
    const [favoriteShows, setFavoriteShows] = useState<ShowDetailResponse[]>([]);
    const [recommendedMovies, setRecommendedMovies] = useState<MovieListResult[]>([]);
    const [recommendedShows, setRecommendedShows] = useState<ShowListResult[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const [selectedType, setSelectedType] = useState<"movie" | "show">("movie");

    // State to track pages per favorite item
    const [favoritePages, setFavoritePages] = useState<{ [id: number]: number }>({});

    // Use useRef to maintain unique IDs across renders and pages
    const uniqueMovies = useRef(new Set<number>());
    const uniqueShows = useRef(new Set<number>());

    const client = new TMDBCClient();

    const getRecentMovieFavs = async () => {
        const favsres = await getRecentMovieFavorites();
        const movies = [];
        if (favsres == null) {
            console.log("Have to favorite movies");
        } else {
            for (const item of favsres) {
                const movieItem = await client.fetchMovieByID(item.movie_id);
                movies.push(movieItem);
            }
            setFavoriteMovies(movies);
        }
    };

    const getRecentShowFavs = async () => {
        const favsres = await getRecentShowFavorites();
        const shows = [];
        if (favsres == null) {
            console.log("Have to favorite shows");
        } else {
            for (const item of favsres) {
                const showItem = await client.fetchShowByID(item.show_id);
                shows.push(showItem);
            }
            setFavoriteShows(shows);
        }
    };

    const getRecommended = async () => {
        let hasMorePages = false;
        const moviesrec: MovieListResult[] = [];
        const showsrec: ShowListResult[] = [];

        if (selectedType === "movie" && favoriteMovies.length > 0) {
            for (const movieitem of favoriteMovies) {
                const page = favoritePages[movieitem.id] || 1;
                const movieres = await client.fetchRecommendedMovieList(
                    movieitem.id,
                    page
                );

                movieres.results.forEach((recMovie) => {
                    if (!uniqueMovies.current.has(recMovie.id)) {
                        uniqueMovies.current.add(recMovie.id);
                        moviesrec.push(recMovie);
                    }
                });

                if (page < movieres.total_pages) {
                    hasMorePages = true;
                    setFavoritePages((prev) => ({ ...prev, [movieitem.id]: page + 1 }));
                }
            }
            setRecommendedMovies((prevMovies) => [...prevMovies, ...moviesrec]);
        } else if (selectedType === "show" && favoriteShows.length > 0) {
            for (const showitem of favoriteShows) {
                const page = favoritePages[showitem.id] || 1;
                const showres = await client.fetchRecommendedShowList(
                    showitem.id,
                    page
                );

                showres.results.forEach((recShow) => {
                    if (!uniqueShows.current.has(recShow.id)) {
                        uniqueShows.current.add(recShow.id);
                        showsrec.push(recShow);
                    }
                });

                if (page < showres.total_pages) {
                    hasMorePages = true;
                    setFavoritePages((prev) => ({ ...prev, [showitem.id]: page + 1 }));
                }
            }
            setRecommendedShows((prevShows) => [...prevShows, ...showsrec]);
        }

        setHasMore(hasMorePages);
    };

    useEffect(() => {
        // Reset state when selectedType changes
        setHasMore(true);
        uniqueMovies.current.clear();
        uniqueShows.current.clear();
        setRecommendedMovies([]);
        setRecommendedShows([]);
        setFavoritePages({});
        getRecentMovieFavs();
        getRecentShowFavs();
    }, [selectedType]);

    useEffect(() => {
        if (selectedType === "movie" && favoriteMovies.length > 0) {
            // Initialize page numbers for each favorite movie
            const pages: { [id: number]: number } = {};
            favoriteMovies.forEach((movie) => {
                pages[movie.id] = 1;
            });
            setFavoritePages(pages);
            getRecommended();
        } else if (selectedType === "show" && favoriteShows.length > 0) {
            // Initialize page numbers for each favorite show
            const pages: { [id: number]: number } = {};
            favoriteShows.forEach((show) => {
                pages[show.id] = 1;
            });
            setFavoritePages(pages);
            getRecommended();
        }
    }, [favoriteMovies, favoriteShows, selectedType]);

    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop + 100 >=
                document.documentElement.offsetHeight &&
            hasMore
        ) {
            getRecommended();
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore]);

    return (
        <div className="w-full">
            <div className="flex justify-center items-center space-x-4 py-4">
                <div
                    onClick={() => setSelectedType("movie")}
                    className="cursor-pointer hover:underline"
                >
                    Movies
                </div>
                <div
                    onClick={() => setSelectedType("show")}
                    className="cursor-pointer hover:underline"
                >
                    Shows
                </div>
            </div>

            <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 w-full">
                {selectedType === "movie" ? (
                    recommendedMovies.length === 0 ? (
                        <p>No movie recommendations available</p>
                    ) : (
                        recommendedMovies.map((recItem) => (
                            <div key={`recommended-movie-${recItem.id}`}>
                                <Moviebox
                                    movie_id={recItem.id}
                                    title={recItem.title}
                                    posterpath={recItem.poster_path}
                                    item={recItem}
                                />
                            </div>
                        ))
                    )
                ) : recommendedShows.length === 0 ? (
                    <p>No show recommendations available</p>
                ) : (
                    recommendedShows.map((recItem) => (
                        <div key={`recommended-show-${recItem.id}`}>
                            <Showbox
                                show_id={recItem.id}
                                title={recItem.name}
                                posterpath={recItem.poster_path}
                                item={recItem}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Recommendations;
