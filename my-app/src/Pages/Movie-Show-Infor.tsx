import { movieListResultToContentItem, showListResultToContentItem, tmdbClient } from "@/Data/TMDB-fetch";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import ActorBox from "../components/ActorBox";
import { useShallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/Data/userstore";
import { Link, Outlet, useParams } from "react-router-dom";
import { addToListByID, supabase } from "@/Data/supabase-client";

const partial_url = "https://image.tmdb.org/t/p/original/";

export const ShowInfo = () => {
  const userLists = useUserStore(useShallow((state) => state.lists));
  const refreshUserLists = useUserStore((state) => state.refreshUserLists);
  const params = useParams();

  const showId = params["id"]!!;

  const { data: show } = useQuery({
    queryKey: [`show_${showId}`],
    queryFn: () => tmdbClient.fetchShowByID(Number(showId)),
  });
  const { data: videoData } = useQuery({
    queryKey: [`show_trailers_${showId}`],
    queryFn: () => tmdbClient.fetchShowTrailer(Number(showId)),
  });

  const { data: creditList } = useQuery({
    queryKey: [`show_credits_${showId}`],
    queryFn: () => tmdbClient.fetchShowCreditList(Number(showId)),
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const handleListAdd = (listId: string) => {
    if  (show) {
      addToListByID(listId, showListResultToContentItem(show)).then((r) => {
        if(r.ok) {
          refreshUserLists()
        }
      })
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!show) return <div>Loading...</div>;

  if (location.pathname.endsWith("comments")) {
    return (
        <Outlet></Outlet>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="fixed right-4 top-4 z-50">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="bg-gray-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <span>Add to List</span>
            <svg
              className="fill-current h-4 w-4 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.292 7.293a1 1 0 011.415 0L10 10.586l3.293-3.293a1 1 0 011.415 1.414l-4 4a 1 1 0 01-1.415 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu absolute text-gray-700 pt-1 bg-white shadow-lg z-50">
              {userLists?.map((list) => (
                <li
                  key={list.list_id}
                  onClick={() => handleListAdd(list.list_id)}
                  className="cursor-pointer hover:bg-gray-200 py-2 px-4 block whitespace-no-wrap transition-colors duration-200"
                >
                  {list.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="relative mt-10 ml-10 flex">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${partial_url + show.poster_path})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <div className="z-20 flex items-center p-10">
          <img
            className="h-96 w-auto object-cover"
            src={partial_url + show.poster_path}
            alt=""
          />
          <div className="ml-10 text-white">
            <p className="text-2xl">{show.original_name}</p>
            <p className="mt-5">{show.vote_average}</p>
            <p className="mt-5">Overview</p>
            <p>{show.overview}</p>
            <p className="mt-5">Release Date: {show.first_air_date}</p>
            <Link to="/WatchItem" state={show} className="flex">
              <p>Watch Movie</p>
              <div className="mt-[2px] ml-1">
                <FontAwesomeIcon icon={faPlay} />
              </div>
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-5 ml-[40px] mb-5">Cast</p>
      <div
        className="flex overflow-x-auto w-full"
      >
        {creditList?.cast?.map((actor) => (
          <ActorBox 
          actor={actor} 
          key={actor.id}>
          </ActorBox>
        ))}
      </div>
      <Link to={`comments`} state={show}>
        <p>Comments</p>
      </Link>
      <p className="mt-5 ml-[40px] mb-5">Media</p>
      <div
        className="flex overflow-x-auto"
      >
        {videoData?.results.length !== 0 ? (
          <div className="flex gap-4 overflow-x-auto">
            {videoData?.results.map((video) => (
              <VideoComponent videoKey={video.key} key={video.key} />
            ))}
          </div>
        ) : (
          <div className="h-6">No trailers available</div>
        )}
      </div>
    </div>
  );
}

const MovieInfo = () => {
  const userLists = useUserStore(useShallow((state) => state.lists));
  const refreshUserLists = useUserStore((state) => state.refreshUserLists);
  const params = useParams();

  const movieId = params["id"]!!;

  const { data: movie } = useQuery({
    queryKey: [`movie_${movieId}`],
    queryFn: () => tmdbClient.fetchMovieByID(Number(movieId)),
  });
  const { data: videoData } = useQuery({
    queryKey: [`movie_trailers_${movieId}`],
    queryFn: () => tmdbClient.fetchMovieTrailer(Number(movieId)),
  });

  const { data: creditList } = useQuery({
    queryKey: [`movie_credits_${movieId}`],
    queryFn: () => tmdbClient.fetchCreditList(Number(movieId)),
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const handleListAdd = (listId: string) => {
    if  (movie) {
      addToListByID(listId, movieListResultToContentItem(movie)).then((r) => {
        if(r.ok) {
          refreshUserLists()
        }
      })
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!movie) return <div>Loading...</div>;

  if (location.pathname.endsWith("comments")) {
    return (
        <Outlet></Outlet>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="fixed right-4 top-4 z-50">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="bg-gray-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <span>Add to List</span>
            <svg
              className="fill-current h-4 w-4 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.292 7.293a1 1 0 011.415 0L10 10.586l3.293-3.293a1 1 0 011.415 1.414l-4 4a 1 1 0 01-1.415 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu absolute text-gray-700 pt-1 bg-white shadow-lg z-50">
              {userLists?.map((list) => (
                <li
                  key={list.list_id}
                  onClick={() => handleListAdd(list.list_id)}
                  className="cursor-pointer hover:bg-gray-200 py-2 px-4 block whitespace-no-wrap transition-colors duration-200"
                >
                  {list.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="relative mt-10 ml-10 flex">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${partial_url + movie.poster_path})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <div className="z-20 flex items-center p-10">
          <img
            className="h-96 w-auto object-cover"
            src={partial_url + movie.poster_path}
            alt=""
          />
          <div className="ml-10 text-white">
            <p className="text-2xl">{movie.title}</p>
            <p className="mt-5">{movie.vote_average}</p>
            <p className="mt-5">Overview</p>
            <p>{movie.overview}</p>
            <p className="mt-5">Release Date: {movie.release_date}</p>
            <Link to="/WatchItem" state={movie} className="flex">
              <p>Watch Movie</p>
              <div className="mt-[2px] ml-1">
                <FontAwesomeIcon icon={faPlay} />
              </div>
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-5 ml-[40px] mb-5">Cast</p>
      <div
        className="flex overflow-x-auto w-full"
      >
        {creditList?.cast?.map((actor) => (
          <ActorBox 
          actor={actor} 
          key={actor.id}>
          </ActorBox>
        ))}
      </div>
      <Link to={`comments`} state={movie}>
        <p>Comments</p>
      </Link>
      <p className="mt-5 ml-[40px] mb-5">Media</p>
      <div
        className="flex overflow-x-auto"
      >
        {videoData?.results.length !== 0 ? (
          <div className="flex gap-4 overflow-x-auto">
            {videoData?.results.map((video) => (
              <VideoComponent videoKey={video.key} key={video.key} />
            ))}
          </div>
        ) : (
          <div className="h-6">No trailers available</div>
        )}
      </div>
    </div>
  );
};

interface video {
  videoKey: string | undefined;
}

function VideoComponent({ videoKey }: video) {
  const embedUrl = `https://www.youtube.com/embed/${videoKey}`;

  return (
    <iframe
      width="560"
      height="315"
      src={embedUrl}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="mx-5"
    ></iframe>
  );
}

export default MovieInfo;
