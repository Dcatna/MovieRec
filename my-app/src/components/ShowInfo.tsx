import { MovieTrailer, ShowListResult } from "@/types/MovieListResponse";
import { Cast, Credit } from "@/types/types";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ActorBox from "./ActorBox";
import TMDBCClient from "@/Data/TMDB-fetch";
import { selectListsByUserId, addToListByID } from "@/Data/supabase-client";
import { useUserStore, ListWithItems, ListItem } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import { useRefresh } from "./RefreshContext";

const partial_url = "https://image.tmdb.org/t/p/original/";

const Showinfo = () => {
  const client = useUserStore(useShallow((state) => state.stored));
  const { setShouldRefresh } = useRefresh();

  const location = useLocation();
  const item = location.state.item as ListItem | ShowListResult;

  const [show, setShow] = useState<ShowListResult | null>(null);
  const tmdbclient = new TMDBCClient();
  const [videoData, setVideoData] = useState<MovieTrailer>();
  const [actors, setActors] = useState<Cast[]>();
  const [userLists, setUserLists] = useState<ListWithItems[]>();

  useEffect(() => {
    const initializeShow = async () => {
      if ("overview" in item) {
        // Item is already a ShowListResult
        setShow(item);
      } else {
        // Item is a ListItem, need to fetch full show details
        const result = await tmdbclient.fetchShowByID(item.show_id);
        setShow({
          ...result,
          genre_ids: result.genres?.map((genre) => genre.id) || [],
          title: result.name || "",
        });
      }
    };

    initializeShow();
  }, [item]);

  async function fetchShowTrailer() {
    if (!show) return;
    const video_response: Promise<MovieTrailer> = tmdbclient.fetchShowTrailer(show.id);
    const trailer: MovieTrailer = await video_response;
    setVideoData(trailer);
  }

  async function fetchCredits() {
    if (!show) return;
    const cred: Promise<Credit> = tmdbclient.fetchShowCreditList(show.id);
    const credits: Credit = await cred;
    setActors(credits.cast);
  }

  async function getUserLists() {
    if (client?.user_id) {
      const lists = await selectListsByUserId(client.user_id);
      setUserLists(lists as ListWithItems[]);
    } else {
      console.log("user not logged in");
    }
  }

  useEffect(() => {
    if (show) {
      fetchCredits();
      getUserLists();
      fetchShowTrailer();
    }
  }, [show]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!show) return <div>Loading...</div>;

  return (
    <div className="overflow-x-hidden overflow-y-auto">
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
              <path d="M5.292 7.293a1 1 0 011.415 0L10 10.586l3.293-3.293a1 1 0 011.415 1.414l-4 4a1 1 0 01-1.415 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu absolute text-gray-700 pt-1 bg-white shadow-lg z-50">
              {userLists?.map((list) => (
                <li
                  key={list.list_id}
                  onClick={() => {
                    addToListByID(list.list_id, undefined, show, client);
                    setShouldRefresh(true);
                  }}
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
          <img className="h-96 w-auto object-cover" src={partial_url + show.poster_path} alt="" />
          <div className="ml-10 text-white">
            <p className="text-2xl">{show.name}</p>
            <p className="mt-5">{show.vote_average}</p>
            <p className="mt-5">Overview</p>
            <p>{show.overview}</p>
            <p className="mt-5">Release Date: {show.first_air_date}</p>
            <Link to="/WatchShow" state={show} className="flex">
              <p>Watch Show</p>
              <div className="mt-[2px] ml-1">
                <FontAwesomeIcon icon={faPlay} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-row mt-10 ml-10">
        <div className="flex flex-col flex-grow">
          <div>
            <p className="mt-5 ml-[40px] mb-5">Cast</p>
            <div className="flex overflow-x-auto" style={{ width: "1000px", marginLeft: "40px" }}>
              {actors?.map((actor) => (
                <ActorBox actor={actor} key={actor.id}></ActorBox>
              ))}
            </div>
            <Link to={`${show.id}/comments`} state={show}>
              <p>Comments</p>
            </Link>
            <p className="mt-5 ml-[40px]">Media</p>
            <div className="flex overflow-x-auto" style={{ width: "1000px", marginLeft: "40px" }}>
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
        </div>
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

export default Showinfo;
