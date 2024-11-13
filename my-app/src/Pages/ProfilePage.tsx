import { useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import {  useState } from "react";
import {  ListWithPostersRpcResponse, supabase } from "@/Data/supabase-client";
import { FaTrashAlt, FaEye, FaEyeSlash, FaPen } from 'react-icons/fa'; // Importing pen icon
import defualt_user_image from "../components/user_default.jpg";

const ProfilePage = () => {
  const user = useUserStore(useShallow((state) => state.userdata?.stored));
  const userLists = useUserStore(useShallow(state => state.lists))
  const deleteListById = useUserStore((state => state.deleteList));
  const [_, setSelectedImage] = useState<File | null>(null);

  async function handleDelete(list_id: string) {
    deleteListById(list_id);
  }

  async function handleProfileImageUpload(file: File) {
    try {
      const { data: imageData, error: uploadError } = await supabase
        .storage
        .from("profile_images")
        .upload(`public/${user?.user_id}/${file.name}`, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
      }
      const imageUrl = supabase.storage.from("profile_images").getPublicUrl(imageData.path).data.publicUrl;
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
  console.log(user?.profile_image, "PROFIEL")
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full mt-10 relative">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              className="rounded-full h-24 w-24 border-2 border-gray-300"
              src={user?.profile_image || defualt_user_image}
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
          <h2 className="mt-4 text-xl font-semibold text-black">{user?.username ?? "User"}</h2>
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
                      onClick={() => {}}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Toggle visibility"
                    >
                      {list.public ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </button>
                  </div>
                </div>
            ))
          ) : (
            <p className="text-center text-gray-500">You have no lists yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
