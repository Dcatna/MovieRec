import { ListWithItems, useUserStore } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import default_image from "./user_default.jpg";
import { useEffect, useState } from "react";
import { selectListsByUserId } from "@/Data/supabase-client";

const YourProfileScreen = () => {
  const user = useUserStore(useShallow((state) => state.stored));
  const [userLists, setUserLists] = useState<ListWithItems[]>([]);
  
  useEffect(() => {
    const fetchUserLists = async () => {
      const res = await selectListsByUserId(user.user_id);
      setUserLists(res);
    };
    fetchUserLists();
  }, [user.user_id]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-4">
      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full mt-10">
        <div className="flex flex-col items-center">
          <img
            className="rounded-full h-24 w-24 border-2 border-gray-300"
            src={user.profile_image || default_image}
            alt="Profile Picture"
          />
          <h2 className="mt-4 text-xl font-semibold text-black">{user.username || "User"}</h2>
          <p className="text-gray-500 text-sm">ID: {user.user_id}</p>
        </div>
      </div>

      {/* Lists Card */}
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-6">
        <h2 className="text-xl font-medium text-gray-700 mb-4 text-center">Your Lists</h2>
        <p className="text-center text-gray-600 mb-4">
          Total Lists: <span className="font-semibold">{userLists.length}</span>
        </p>
        <div className="space-y-4">
          {userLists.length > 0 ? (
            userLists.map((list) => (
              <div key={list.list_id} className="bg-gray-50 rounded-md p-4 shadow-md">
                <h3 className="text-lg font-medium text-gray-800">{list.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{list.description || "No description provided"}</p>
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
