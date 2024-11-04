import { MovieListResult } from "@/types/MovieListResponse";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getComments, insertComment, insertReply } from "@/Data/supabase-client";
import CommentBox, { CommentType } from "./CommentBox";
import { useState } from "react";
import { useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";

const CommentsPage = () => {
    const location = useLocation();
    const movie: MovieListResult = location.state;
    const [currComment, setCurrComment] = useState<string>("");
    const [activeReply, setActiveReply] = useState<number | null>(null);
    const user = useUserStore(useShallow((state) => state.stored));
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // Initialize navigate hook

    const { data: comments, isLoading, error } = useQuery<CommentType[], Error>(
        ["comments", movie.id], 
        () => getComments(movie.id, -1),
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
                await insertComment(movie.id, -1, user.user_id, date, currComment);
            } else {
                // Insert reply to a specific comment
                await insertReply(date, user.user_id, currComment, activeReply);
                setActiveReply(null);
            }

            // Clear the input and refresh comments
            setCurrComment("");
            queryClient.invalidateQueries(["comments", movie.id]);

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
                            ← Back to {movie.title}
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
                                refreshReplies={activeReply === comment.id ? () => getComments(movie.id, -1) : undefined}
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
