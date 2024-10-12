import { supabase } from '@/Data/supabase-client';
import { useUserStore } from '@/Data/userstore';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import { useShallow } from 'zustand/shallow';
import { useRefresh } from './RefreshContext';

const PopupExample = () => {
  const [name, setName] = useState("");
  const client = useUserStore(useShallow((state) => state.stored));
  const { setShouldRefresh } = useRefresh(); // Destructure only setShouldRefresh as you don't need shouldRefresh here

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log(client?.user_id);
    const { data, error } = await supabase
      .from("userlist")
      .insert([{ name: name, user_id: client?.user_id }]);
    
    if (error) {
      console.error(error);
    } else {
      console.log("Inserted:", data);
      setName(""); // Clear the input field
      setShouldRefresh(true); // Set the flag to refresh the lists in Sidebar
    }
  };

  return (
    <Popup trigger={<FontAwesomeIcon className="size-7" icon={faPlus} />} modal className='w-[100%] bg-black'>
      <div className="">
        <div className="flex justify-center items-center">
          <div className="p-10 bg-white rounded shadow-md min-w-sm">
            <h1 className="text-xl font-bold text-center mb- text-black">
              Create A New List
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center justify-center"
            >
              <input
                type="text"
                placeholder="List Name"
                className="mx-2 border-2 text-black border-blue-700 hover:border-blue-800 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 px-8 py-2 rounded-md text-white"
              >
                Create!
              </button>
            </form>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default PopupExample;
