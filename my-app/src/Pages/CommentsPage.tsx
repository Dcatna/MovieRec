import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getComments, insertComment, insertReply } from "@/Data/supabase-client";
import CommentBox, { CommentType } from "../components/CommentBox";
import { useState } from "react";
import { ContentItem, useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import { useStateProducer } from "./ListViewPage";
import { movieListResultToContentItem, tmdbClient } from "@/Data/TMDB-fetch";

const CommentsPage = () => {

    const location = useLocation();
    const params = useParams();

    const id = Number(params['id'])
    const isMovie = location.pathname.includes("movie")
    const favorites = useUserStore(useShallow(state => state.favorites))
    
    const movieId = isMovie ? id : -1
    const showId = isMovie ? -1 : id

    const item = useStateProducer<ContentItem | undefined>(undefined,async (update) => {
        if (isMovie) {
            tmdbClient.fetchMovieByID(movieId).then((r) => {
                const item = movieListResultToContentItem(r)
                update(
                    {
                        ...item,
                        favorite: favorites.includes({...item, favorite: true})
                    }

                )
            })
        } else {
            tmdbClient.fetchShowByID(showId)
        }
    }, [])

    const queryClient = useQueryClient()

    const [currComment, setCurrComment] = useState<string>("");
    const [activeReply, setActiveReply] = useState<number | null>(null);
    const user = useUserStore(useShallow((state) => state.userdata?.stored));

    const navigate = useNavigate(); // Initialize navigate hook

    const { data: comments, isLoading, error } = useQuery<CommentType[], Error>(
        ["comments", id, isMovie], 
        () => getComments(movieId, showId),
        {
            staleTime: 1000 * 60 * 5, // Cache for 5 minutes
            cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
            retry: 1, // Retry once on failure
        }
    );

    const handleReply = (commentId: number) => {
        setActiveReply(commentId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const date = new Date().toISOString();

        if (currComment.trim() === "") return;

        try {
            if (!activeReply) {
                // Insert new comment
                await insertComment(movieId, showId, user?.user_id!!, date, currComment);
            } else {
                // Insert reply to a specific comment
                await insertReply(date, user?.user_id!!, currComment, activeReply);
                setActiveReply(null);
            }

            // Clear the input and refresh comments
            setCurrComment("");
            queryClient.invalidateQueries(["comments", id, isMovie]);

        } catch (error) {
            console.error("Failed to add comment or reply:", error);
        }
    };

    if (isLoading) return <div>Loading comments...</div>;
    if (error) return <div>Error fetching comments: {error.message}</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <div className="p-4 flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-blue-600 font-bold"
                        >
                            ← Back to {item?.name}
                        </button>
                    
                    </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-4 rounded-lg shadow-md">
                            <CommentBox
                                comment={comment}
                                singleComment={false}
                                onReplyClick={() => handleReply(comment.id)}
                                replyActive={false}
                                refreshReplies={activeReply === comment.id ? () => getComments(movieId, showId) : undefined}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No comments available.</p>
                )}
            </div>
            <form
                className="fixed bottom-0 w-3/4 p-4 bg-white border-t border-gray-300 flex items-center space-x-3 shadow-md"
                onSubmit={handleSubmit}
            >
                <input 
                    className="bg-gray-100 rounded-full flex-1 p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={activeReply ? "Replying..." : "Add a comment..."}
                    type="text"
                    value={currComment}
                    onChange={(e) => setCurrComment(e.target.value)}
                />
                <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                    Post
                </button>
                {activeReply && (
                    <button
                        onClick={() => setActiveReply(null)}
                        className="px-4 text-sm text-red-500 hover:underline"
                    >
                        Cancel
                    </button>
                )}
            </form>
        </div>

    );
};

export default CommentsPage;
