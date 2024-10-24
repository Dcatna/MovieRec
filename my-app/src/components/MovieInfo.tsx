import TMDBCClient from "@/Data/TMDB-fetch";
import { MovieTrailer } from "@/types/MovieListResponse";
import { Cast, Credit} from "@/types/types";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { movieBoxProp } from "./Moviebox";
import ActorBox from "./ActorBox";


const partial_url = "https://image.tmdb.org/t/p/original/"
export interface commentType{
  id : string,
  created_at: string,
  user_id : string,
  message : string,
  movie_id : number,
  show_id : number,
  users : {username : string | undefined, profile_image : string | undefined}
}
export type userType = {
  uid : string | undefined,
}
const MovieInfo = () => {
    const location = useLocation()
    const movie : movieBoxProp = location.state
    const tmdbclient = new TMDBCClient()
    const [videoData, setVideoData] = useState<MovieTrailer>()
    const [actors, setActors] = useState<Cast[]>()
    // const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>()
    // const [comments, setComments] = useState<CommentWithReply[]>([])

    async function fetchMovieTrailer() {
        const video_response: Promise<MovieTrailer> = tmdbclient.fetchMovieTrailer(movie.item.id);
        
        const trailer: MovieTrailer = await video_response
        
        setVideoData(trailer)
    }   
    async function fetchCredits() {
      const cred : Promise<Credit> = tmdbclient.fetchCreditList(movie.item.id)
      const credits : Credit = await cred
      setActors(credits.cast)
    }
    // async function fetchSimilarMovies() {
    //   const res : Promise<SimilarMovieResult> = tmdbclient.fetchSimilarMovie(movie.item.id)
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
    //   console.log(client2?.user.id, "USERS")
    //    const data = await commentWithReply(client?.user.id, movie.item.id, -1)
    //     setComments(data as CommentWithReply[]);
      
    // }
   
    useEffect(() => {
        fetchMovieTrailer()
        fetchCredits()
        // fetchSimilarMovies()
        // getComments().catch()
    }, [movie])

    // const addNewComment = (newComment : CommentWithReply) => {
    //   setComments(prevComments => [newComment, ...prevComments]);
    // }
    
  return (
    <div className='overflow-x-hidden overflow-y-auto'>
      <div className='fixed right-4 top-4 z-50'>
        {/* <MovieBoxPopup movie={movie} show={undefined}/> */}
      </div>
      <div className='relative mt-10 ml-10 flex' >
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie.item.poster_path})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
          <div className='z-20 flex items-center p-10'>
            <img className="h-96 w-auto object-cover" src={partial_url + movie.item.poster_path} alt="" />
            <div className='ml-10 text-white'>
              <p className="text-2xl">{movie.item.title}</p>
              <p className='mt-5'>{movie.item.vote_average}</p>
              <p className='mt-5'>Overview</p>
              <p >{movie.item.overview}</p>
              <Link to= "/WatchItem" state = {movie} className='flex'>
                <p>Watch Movie</p>
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
      <div className='flex overflow-x-auto ' style={{width: '1000px', marginLeft:'40px'}}>
        {actors?.map((actor) => (
          <ActorBox actor={actor}></ActorBox>
        ))}
      </div>
      <p className='mt-5 ml-[40px] mb-5'>Comments</p>
        {/* <div className='ml-[45px]'>
          {comments?.length != 0 ? <CommentBox comment={comments[0]} singleComment={true} onReplyClick={undefined} replyActive={false} refreshReplies={undefined}></CommentBox>: <div>There are no comments</div>}
          <CommentPopup movieorshow={movie.item.id} isMovie={true} ></CommentPopup>
        </div> */}
      <p className='mt-5 ml-[40px] mb-5'>Media</p>
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


export default MovieInfo