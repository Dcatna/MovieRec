import { getUserLikedComment, insertLikeByUser, removeLikeByUser, supabase } from "@/Data/supabase-client";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultimage from "./user_default.jpg";
import ReplyBox from "./Replybox";
import { useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";

export interface CommentType {
    id : number,
    user_id : string | undefined,
    movie_id : number,
    show_id : number,
    created_at : string,
    message : string,
    profile_image : string | undefined,
    likes : number,
    user_liked : boolean,
    replies : number,
    total : number,
    username : string | undefined
}

export interface Comment {
    comment : CommentType,
    singleComment : boolean,
    onReplyClick : (() => void) | undefined,
    replyActive : boolean,
    refreshReplies : (() => void) | undefined
}

export interface replyType {
    id : number,
    created_at : string,
    user_id : string,
    message : string,
    cid : number,
    user : { username : string | undefined, profile_image : string | undefined }
}

const CommentBox = ({ comment, singleComment, onReplyClick, replyActive, refreshReplies } : Comment) => {
    const user = useUserStore(useShallow((state) => state.stored));

    const date = new Date(comment.created_at);
    const [image, setImage] = useState<string>("");
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<replyType[]>([]);
    const [liked, setLiked] = useState(comment.user_liked);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const navigate = useNavigate();


    const handleClick = () => {
        navigate(`/profile/${comment.username}`, { state: comment });
    }

    const getImageUrl = (profile_image : string | undefined) => {
        if (profile_image) {
            const {data} = supabase.storage.from("profile_pictures").getPublicUrl(profile_image);
            if (data.publicUrl !== undefined) {
                setImage(data.publicUrl);
            }
        } else {
            setImage(defaultimage);
        }
    };

    async function getReplies() {
        const { data, error } = await supabase.from("reply").select("*, user:users!reply_user_id_fkey(username, profile_image)").eq("cid", comment.id).order("created_at", { ascending: false });
        if (error) {
            console.log(error);
            return;
        }
        setReplies(data as replyType[]);
    }
    async function getLiked() {
        const res = await getUserLikedComment(comment.id, user.user_id)

        setLiked(res)
    }
    useEffect(() => {
        getImageUrl(comment.profile_image);
        getReplies();
        getLiked()
    }, [replyActive, refreshReplies]);

    const toggleReplies = async () => {
        await getReplies();
        setShowReplies(!showReplies);
    };

    const handleLike = async () => {
        const newLikedStatus = !liked;
        setLiked(newLikedStatus);
        
        setLikeCount(prevCount => newLikedStatus ? prevCount + 1 : prevCount - 1);
        try {
            if (newLikedStatus) {
                await insertLikeByUser(comment.id, user.user_id)
            } else {
                await removeLikeByUser(comment.id, user.user_id)
            }
        } catch (error) {
            console.error("Error updating like:", error);
            setLiked(!newLikedStatus);
            setLikeCount(prevCount => newLikedStatus ? prevCount - 1 : prevCount + 1);
        }
    }

    return (
        <div className="flex w-full">
            <div onClick={handleClick} className="cursor-pointer">
                <img className="rounded-full h-12 w-12 border-2 border-gray-300" src={image} alt="" />
            </div>
            <div className="col ml-2 flex-grow">
                <div onClick={handleClick} className="cursor-pointer">
                    <div className={`flex ${singleComment ? 'text-white' : 'text-black'}`}>
                        {comment.username}
                        <div className="ml-2 text-sm text-gray-500">
                            {date.toLocaleDateString("en-US", {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
                <div className={`mt-1 ${singleComment ? 'text-white' : 'text-black'} break-words w-full`}>
                    <div className="flex justify-between items-center w-full">
                        <p className="break-all flex-grow max-w-full overflow-hidden">
                            {comment.message}
                        </p>
                        <button onClick={handleLike} className="ml-4 flex items-center space-x-1 text-red-500">
                            <FontAwesomeIcon icon={faHeart} className={liked ? 'text-red-600' : 'text-gray-500'} />
                            <span>{likeCount}</span>
                        </button>
                    </div>
                    <div className="mt-2">
                        <p onClick={onReplyClick} className="cursor-pointer text-blue-500">Reply</p>
                        {comment.replies > 0 && !showReplies && (
                            <p onClick={toggleReplies} className="cursor-pointer text-blue-500">View {comment.replies} more reply</p>
                        )}
                        {showReplies && (
                            <div className="ml-4">
                                {replies.map((reply: replyType) => (
                                    <div key={reply.id}>
                                        <ReplyBox reply={reply} />
                                    </div>
                                ))}
                                <p className="cursor-pointer text-blue-500 mt-2" onClick={toggleReplies}>Hide Replies</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CommentBox;
