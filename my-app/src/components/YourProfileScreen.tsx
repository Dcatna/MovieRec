import { ListWithItems, useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import default_image from "./user_default.jpg";
import { useEffect, useState } from "react";
import { deleteListById, publicToggleByListId, selectListsByUserId } from "@/Data/supabase-client";
import { FaTrashAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useQueryClient } from "@tanstack/react-query";

const YourProfileScreen = () => {
  const user = useUserStore(useShallow((state) => state.stored));
  const [userLists, setUserLists] = useState<ListWithItems[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUserLists = async () => {
      const res = await selectListsByUserId(user.user_id);
      setUserLists(res);
    };
    fetchUserLists();
  }, [user.user_id]);

  async function handleDelete(list_id) {
    const res = await deleteListById(list_id);
    if (res === 0) {
      // Invalidate the cache or refetch the lists
      queryClient.invalidateQueries(['user_lists', user?.user_id]);
      setUserLists((prevLists) => prevLists.filter((list) => list.list_id !== list_id));
    }
  }

  async function handleVisibilityToggle(list_id) {
    // Toggle visibility in the database
    await publicToggleByListId(list_id);

    // Update visibility in the local state
    setUserLists((prevLists) =>
      prevLists.map((list) =>
        list.list_id === list_id ? { ...list, public: !list.public } : list
      )
    );

    // Optionally, invalidate the cache to refetch data if needed
    queryClient.invalidateQueries(['user_lists', user?.user_id]);
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full mt-10">
        <div className="flex flex-col items-center">
          <img
            className="rounded-full h-24 w-24 border-2 border-gray-300"
            src={user.profile_image || default_image}
            alt="Profile Picture"
          />
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
            userLists.map((list) => (
              <div key={list.list_id} className="bg-gray-50 rounded-md p-4 shadow-md flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{list.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{list.description || "No description provided"}</p>
                  <p className="text-gray-800 text-sm mt-1">{list.listitem.length} Items</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(list.list_id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete list"
                  >
                    <FaTrashAlt size={16} />
                  </button>

                  {/* Visibility toggle */}
                  <button
                    onClick={() => handleVisibilityToggle(list.list_id)}
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

export default YourProfileScreen;