import { supabase } from "@/Data/supabase-client"
import { faHeart } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import defaultimage from "./user_default.jpg"
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
export interface Comment{
    comment : CommentType
}
const CommentBox = ({comment} : Comment) => {
    //const [userImage, setUserImage] = useState<string>()
    const date = new Date(comment.created_at)
    const [image, setImage] = useState<string>("")


    const getImageUrl = (profile_image : string | undefined) => {
        
        if (profile_image) {
            const {data} = supabase.storage.from("profile_pictures").getPublicUrl(profile_image)
            
            if(data.publicUrl != undefined){
                setImage(data.publicUrl)
            }
            
        }
        else{
            setImage(defaultimage)
        }
    }

    useEffect(() => {
      
        getImageUrl(comment.profile_image)
    },[])


  return (
    <div className='flex'>
        <Link to={`/home/userprofile/${comment.user_id}`} state={comment}>
            <img className="rounded-full h-12 w-12 border-2 border-gray-300" src={image} alt="" />
        </Link>
        <div className='col ml-2'>
            <Link to={`/home/userprofile/${comment.user_id}`} state={comment}>
                {true == true ?
                <div className='flex text-white'>
                    {comment.username}
                    <div className='ml-2'>
                        {date.toLocaleDateString("en-US", {
                            month : 'long',
                            day : 'numeric',
                            year : 'numeric'
                        })}
                    </div>
                </div> : <div className='flex text-black'>
                    {comment.username}
                    <div className='ml-2'>
                        {date.toLocaleDateString("en-US", {
                            month : 'long',
                            day : 'numeric',
                            year : 'numeric'
                        })}
                    </div>
                    
                </div>}
            </Link>
            {true == true ? <div className='text-white break-words overflow-hidden w-[400px]'>
                <p className='break-words'>{comment.message}</p>
            </div> : <div className='text-black break-words overflow-hidden w-[400px] flex flex-col'>
                <div className='relative'>
                    <p className='break-words'>{comment.message}</p>
                    <FontAwesomeIcon icon={faHeart} className='absolute right-0 top-1/2 transform -translate-y-1/2' />
                </div>
               
            </div>}
        </div>
    </div>
  )
}

export default CommentBox