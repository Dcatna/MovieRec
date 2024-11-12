import { Link, useLocation } from "react-router-dom";
import { CommentType } from "./CommentBox";
import { ListWithPostersRpcResponse, selectListsByIdsWithPoster, supabase } from "@/Data/supabase-client";
import { useEffect, useState } from "react";
import default_image from "./user_default.jpg";

const OtherProfileScreen = () => {
    const location = useLocation();
    const userInfo: CommentType = location.state;
    const [userLists, setUserLists] = useState<ListWithPostersRpcResponse[]>([]);
    const [image, setImage] = useState<string>("");

    async function getUserLists() {
        const res = await selectListsByIdsWithPoster(userInfo.user_id)
        setUserLists(res)
    }
    const getImageUrl = (profile_image : string | undefined) => {
        
        if (profile_image) {
            const {data} = supabase.storage.from("profile_pictures").getPublicUrl(profile_image)
            
            if(data.publicUrl != undefined){
                setImage(data.publicUrl)
            }
            
        }
        else{
            setImage(default_image)
        }
    }

    useEffect(() => {
        getImageUrl(userInfo.profile_image)
        getUserLists();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-10">
                <div className="flex justify-center mb-4">
                    <img
                        className="rounded-full h-24 w-24 border-2 border-gray-300"
                        src={image}
                        alt="Profile picture"
                    />
                </div>
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
                    {userInfo.username}
                </h2>
                <div className="text-center text-gray-600">
                    <p className="font-medium">
                        Total Lists: <span className="font-semibold">{userLists.length}</span>
                    </p>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">User's Lists</h3>
                    <ul className="space-y-3">
                        {userLists.length > 0 ? (
                            userLists.map((list) => (
                                <Link to={`/home/list/${list.list_id}`} state={{item : list}}>
                                    <li key={list.list_id} className="bg-gray-50 p-3 rounded-md shadow-sm">
                                        <p className="text-gray-800 font-medium">{list.name}</p>
                                    </li>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No lists available</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OtherProfileScreen;
