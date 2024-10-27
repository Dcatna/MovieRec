import { MovieTrailer, ShowListResult } from "@/types/MovieListResponse"
import { Cast, Credit} from "@/types/types"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import ActorBox from "./ActorBox"
import { showBoxProp } from "./Showbox"
import TMDBCClient from "@/Data/TMDB-fetch"
import { selectListsByUserId, addToListByID } from "@/Data/supabase-client"
import { useUserStore, ListWithItems } from "@/Data/userstore"
import { useShallow } from "zustand/shallow"

const partial_url = "https://image.tmdb.org/t/p/original/"

const Showinfo = () => {
    const client = useUserStore(useShallow((state) => state.stored));

    const location = useLocation()
    const show : showBoxProp = location.state
    const tmdbclient = new TMDBCClient()
    const [videoData, setVideoData] = useState<MovieTrailer>()
    const [actors, setActors] = useState<Cast[]>()
    const [userLists, setUserLists] = useState<ListWithItems[]>()

    // const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>()
    // const [comments, setComments] = useState<CommentWithReply[]>([])

    async function fetchShowTrailer() {
      const video_response: Promise<MovieTrailer> = tmdbclient.fetchShowTrailer(show.show_id);
      
      const trailer: MovieTrailer = await video_response
      // console.log(trailer, "Tialer")
      setVideoData(trailer)
  }   
    async function fetchCredits() {
      const cred : Promise<Credit> = tmdbclient.fetchShowCreditList(show.show_id)
      const credits : Credit = await cred
      setActors(credits.cast)
    }
    // async function fetchSimilarShows() {
    //   const res : Promise<SimilarMovieResult> = tmdbclient.fetchSimilarShow(show.item.id)
    //   const movies : SimilarMovieResult = await res
    //   const convertedMovies = movies.results.map(similarMovie => ({
    //     ...similarMovie,
    //     media_type: 'movie', // Assuming 'movie' as default for conversion
    //     backdrop_path: similarMovie.backdrop_path || '', // Ensuring value is not undefined
    //     poster_path: similarMovie.poster_path || '', // Ensuring value is not undefined
    //   }));
    //   setSimilarMovies(convertedMovies)
    // }
    // async function getComments() {
    //   const data = await commentWithReply(client?.user.id, -1, show.item.id)
    //     setComments(data as CommentWithReply[]);
      
    // }
    async function getUserLists(){
      if (client?.user_id){
        const lists = await selectListsByUserId(client?.user_id)
        setUserLists(lists as ListWithItems[])

      }else{
        console.log("user not logged in")
      }
    }

    async function reFetchShow(){
      const result = await tmdbclient.fetchShowByID(show.show_id)
      show.item = {
        ...result,
        genre_ids: result.genres?.map((genre) => genre.id) || [], // Assuming `genres` is an array of objects with an `id`
        title: result.name || "", // Assuming `name` is equivalent to `title`
      } as ShowListResult;
    }


    useEffect(() => {
        console.log(show.item, "SHOWITEMS")
        if (show.item.overview == undefined) {
          reFetchShow()
        }
        fetchCredits()
        getUserLists()
        // fetchSimilarShows()
        fetchShowTrailer()
        // getComments().catch()
    }, [show])

    // const addNewComment = (newComment : commentType) => {
    //   setComments(prevComments => [newComment, ...prevComments]);
    // }
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  return (
    <div className='overflow-x-hidden overflow-y-auto'>
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
                      alert(`Added "${show.item.title}" to ${list.name}`);
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
    <div className='relative mt-10 ml-10 flex'>
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original/${show.item.poster_path})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <div className='z-20 flex items-center p-10'>
          <img className="h-96 w-auto object-cover" src={partial_url + show.item.poster_path} alt="" />
          <div className='ml-10 text-white'>
            <p className="text-2xl">{show.item.title}</p>
            <p className='mt-5'>{show.item.vote_average}</p>
            <p className='mt-5'>Overview</p>
            <p >{show.item.overview}</p>
            <Link to= "/WatchShow" state = {show} className='flex'>
                <p>Watch Show</p>
                <div className='mt-[2px] ml-1'>
                  <FontAwesomeIcon icon={faPlay} />
                </div>
              </Link>
          </div>
        </div>
    </div>

    <div className='flex flex-row mt-10 ml-10'>
  <div className='flex flex-col flex-grow'>
    <div className=''>
      <p className='mt-5 ml-[40px] mb-5'>Cast</p>
      <div className='flex overflow-x-auto' style={{width: '1000px', marginLeft:'40px'}}>
        {actors?.map((actor) => (
          <ActorBox actor={actor}></ActorBox>
        ))}
      </div>
      <p className='mt-5 ml-[40px] mb-5'>Comments</p>
        {/* <div className='ml-[45px]'>
          {comments?.length != 0 ? <CommentBox comment={comments[0]} singleComment={true} onReplyClick={undefined} replyActive={false} refreshReplies={undefined}></CommentBox>: <div>There are no comments</div>}
          <CommentPopup movieorshow={show.item.id} isMovie={false} ></CommentPopup>
        </div> */}
      <p className='mt-5 ml-[40px]'>Media</p>
      <div className='flex overflow-x-auto ' style={{width: '1000px', marginLeft:'40px'}}>
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
  )
}
interface video {
    videoKey : string | undefined
}

//   interface similarProp {
//     item : SimilarMovie
//   }
//   const SimilarBox = ({item} : similarProp) => {
//     const partial_url = "https://image.tmdb.org/t/p/original/"
   
//     const [loaded, setLoaded] = useState(false)

//     return (
//         <div className="relative group">
//         <Link to={'/info'} state={{ item }}>
//             <div className="relative">
//                 <img
//                     onLoad={() => { setLoaded(true) }}
//                     className="w-full h-full rounded-md animate-in"
//                     src={partial_url + item.poster_path}
//                     alt="Movie Poster"
//                 />
//                 <div className="rounded-md absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full h-4/6"/>
//                 <div className="rounded-md absolute bottom-0 left-0 h-full w-full hover:bg-gradient-to-t from-slate-900 to-transparent bg-transparent"/>
//                 {loaded && (
//                     <text className="rounded-md line-clamp-2 absolute bottom-0 left-0 m-2 group-hover:animate-bounce">
//                         {item.title}
//                     </text>
//                 )}
//             </div>
//         </Link>
//     </div>
    
//     )
// }
interface video {
  videoKey : string | undefined
}
function VideoComponent({videoKey} : video) {
  const embedUrl = `https://www.youtube.com/embed/${videoKey}`;

  return (
    <iframe 
      width="560" 
      height="315" 
      src={embedUrl} 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen
      className='mx-5'>
    </iframe>
  );
}
export default Showinfo