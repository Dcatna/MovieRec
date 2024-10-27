import { contentFrom, ListWithPostersRpcResponse, selectListByID} from '@/Data/supabase-client'
import TMDBCClient from '@/Data/TMDB-fetch'
import { MovieListResult, ShowListResult } from '@/types/MovieListResponse'
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ImageGrid } from './poster-item'
import defualtlist from "./movieicon.png";
import Moviebox from './Moviebox'
import Showbox from './Showbox'
import { ShowDetailResponse } from '@/types/types'

const ListPreview = () => {
    const params = useParams()

    const listId = params['listId']
    const location = useLocation();
    const lst: ListWithPostersRpcResponse = location.state?.item
    // console.log(lst, "lSTsdfsdfsdfsdfsdfsdfsd")
    const client = new TMDBCClient()
    const [movies, setMovies] = useState<MovieListResult[]>([])
    const [shows, setShows] = useState<ShowDetailResponse[]>([])

    useEffect(() => {
        // Ensure the list exists and has a valid list_id
        console.log(lst);
        if (!lst || !lst.list_id) {
            console.error("List is undefined or missing list_id.");
            return;
        }
    
        const getLists = async () => {
            try {
                // Fetch list items by list_id
                const listItem = await selectListByID(lst.list_id);
                console.log(listItem, "LSITITEM")
                // Use the fetched listItems directly for processing movies/shows
                if (!listItem || listItem.length === 0) {
                    console.log("No list items found.");
                    return;
                }
    
                // Iterate through the list items and fetch movie/show data
                const fetchedMovies = [];
                const fetchedShows = [];
    
                for (const item of listItem) {
                    if (item.movie_id === -1 && item.show_id) {
                        const showres = await client.fetchShowByID(item.show_id);
                        fetchedShows.push(showres);  // Collect shows
                    } else if (item.movie_id) {
                        const movieres = await client.fetchMovieByID(item.movie_id);
                        fetchedMovies.push(movieres);  // Collect movies
                    }
                }
    
                // Update the states after processing all items
                setMovies(fetchedMovies);
                setShows(fetchedShows);
            } catch (error) {
                console.error("Error fetching list items: ", error);
            }
        };
        setMovies([])
        setShows([])
        getLists();
    }, [listId, lst]);
    
  return (
<div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto">
  <div className="flex items-center justify-between w-full mb-8">
    <div className="w-40 h-40 flex-shrink-0 relative">
      {lst && lst.ids ? (
        <ImageGrid images={contentFrom(lst).map((it) => it.url)} />
      ) : (
        <img
          src={defualtlist}
          alt="default list"
          className="w-full h-full object-cover rounded-md shadow-lg"
        />
      )}
    </div>

    <div className="ml-8 flex flex-col justify-between flex-grow">
      <p className="text-5xl font-bold text-gray-800 mb-2">
        {lst?.name || "Untitled List"}
      </p>
      <p className="text-xl text-gray-500 mb-4">
        Created by {lst?.username || "Unknown"} - {movies.length + shows.length} items
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
        />
      </div>
    ))}
    {shows.map((show: ShowDetailResponse) => {
      // Mapping logic for shows, transforming genres to genre_ids
      const mappedShow = {
        ...show,
        title: show.name || "", // Map `name` to `title` for Showbox
        genre_ids: show.genres ? show.genres.map((genre) => genre.id) : [] // Extract genre IDs
      };

      return (
        <div key={show.id} className="flex flex-col items-center">
          <Showbox
            item={mappedShow}
            show_id={mappedShow.id}
            title={mappedShow.title} // Use `title` here after mapping
            posterpath={mappedShow.poster_path}
          />
        </div>
      );
    })}

  </div>
</div>


  )
}

export default ListPreview