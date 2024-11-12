import { useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import default_image from "./user_default.jpg";
import { useEffect, useState } from "react";
import { deleteListById, ListWithPostersRpcResponse, publicToggleByListId, selectListsByIdsWithPoster, supabase, updateUserProfileImage } from "@/Data/supabase-client";
import { FaTrashAlt, FaEye, FaEyeSlash, FaPen } from 'react-icons/fa'; // Importing pen icon
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

const YourProfileScreen = () => {
  const user = useUserStore(useShallow((state) => state.stored));
  const [userLists, setUserLists] = useState<ListWithPostersRpcResponse[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLists = async () => {
      const res = await selectListsByIdsWithPoster(user.user_id);
      setUserLists(res);
    };
    fetchUserLists();
  }, [user.user_id]);

  async function handleDelete(list_id) {
    const res = await deleteListById(list_id);
    if (res === 0) {
      queryClient.invalidateQueries(['user_lists', user?.user_id]);
      setUserLists((prevLists) => prevLists.filter((list) => list.list_id !== list_id));
      navigate("/profile");
    }
  }

  async function handleVisibilityToggle(list_id) {
    await publicToggleByListId(list_id);
    setUserLists((prevLists) =>
      prevLists.map((list) =>
        list.list_id === list_id ? { ...list, public: !list.public } : list
      )
    );
    queryClient.invalidateQueries(['user_lists', user?.user_id]);
  }

  async function handleProfileImageUpload(file: File) {
    try {
      const { data: imageData, error: uploadError } = await supabase
        .storage
        .from("profile_images")
        .upload(`public/${user.user_id}/${file.name}`, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
      }

      // Get the public URL for the uploaded image
      const imageUrl = supabase.storage.from("profile_images").getPublicUrl(imageData.path).data.publicUrl;

      // Update the user's profile with the new image URL
      await updateUserProfileImage(user.user_id, imageUrl);

      // Refetch user profile data to show the updated image
      queryClient.invalidateQueries(['user_profile', user.user_id]);
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      handleProfileImageUpload(file); // Automatically upload after selection
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full mt-10 relative">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              className="rounded-full h-24 w-24 border-2 border-gray-300"
              src={user.profile_image || default_image}
              alt="Profile Picture"
            />
            {/* Pencil icon overlay */}
            <label className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 cursor-pointer">
              <FaPen className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden" // Hide the file input
              />
            </label>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-black">{user.username || "User"}</h2>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-6">
        <h2 className="text-xl font-medium text-gray-700 mb-4 text-center">Your Lists</h2>
        <p className="text-center text-gray-600 mb-4">
          Total Lists: <span className="font-semibold">{userLists.length}</span>
        </p>

        <div className="space-y-4">
          {userLists.length > 0 ? (
            userLists.map((list: ListWithPostersRpcResponse) => (
              <Link to={`/home/ulist/${list.list_id}`} state={{ item: list }} key={list.list_id}>
                <div key={list.list_id} className="bg-gray-50 rounded-md p-4 shadow-md flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{list.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{list.description || "No description provided"}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(list.list_id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete list"
                    >
                      <FaTrashAlt size={16} />
                    </button>
                    <button
                      onClick={() => handleVisibilityToggle(list.list_id)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Toggle visibility"
                    >
                      {list.public ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">You have no lists yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourProfileScreen;
