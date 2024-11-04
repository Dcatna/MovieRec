import { MovieListResult } from "@/types/MovieListResponse";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getComments } from "@/Data/supabase-client";
import { CommentType } from "./CommentBox";


const CommentsPage = () => {
    const location = useLocation();
    const movie: MovieListResult = location.state;
    //const user = useUserStore(useShallow((state) => state.stored));

    // Use `useQuery` to fetch and cache comments
    const { data: comments, isLoading, error } = useQuery<CommentType[], Error>(
        ["comments", movie.id], // Unique query key based on movie id
        () => getComments(movie.id, -1), // Call getComments with movie_id and show_id (show_id set to -1 for movies)
        {
            staleTime: 1000 * 60 * 5, // Cache for 5 minutes
            cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
            retry: 1, // Retry once on failure
        }
    );

    if (isLoading) return <div>Loading comments...</div>;
    if (error) return <div>Error fetching comments: {error.message}</div>;

    return (
        <div>
            <h2>Comments for {movie.title}</h2>
            {comments && comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.id} className="comment">
                        <p><strong>{comment.username}</strong>: {comment.message}</p>
                    </div>
                ))
            ) : (
                <p>No comments available.</p>
            )}
        </div>
    );
};

export default CommentsPage;
