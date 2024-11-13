import {
  selectListByIdWithItems,
} from "@/Data/supabase-client";
import { ImageGrid } from "../components/poster-item";
import { ListWithItems, useUserStore, ContentItem } from "@/Data/userstore";
import { useShallow } from "zustand/shallow";
import ContentListItem from "../components/ContentListItem";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import defualt_movie_poster from "../components/movieicon.png"

export function useStateProducer<T extends any>(
  defaultValue: T,
  producer: (update: (value: T) => void) => Promise<void>,
  keys: ReadonlyArray<unknown>
): T {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    producer(setValue).catch();
  }, keys);

  return value;
}

const ListViewPage = () => {
  
  const params = useParams();
  const navigate = useNavigate();
  const data = useLoaderData();
  const user = useUserStore(useShallow((state) => state.userdata?.stored));
  const deleteList = useUserStore(useShallow((state) => state.deleteList));
  const favorites = useUserStore(useShallow((state) => state.favorites));
  const listId = params["listId"];



  const list = useStateProducer<ListWithItems | undefined>(
    (data as ListWithItems | null) ?? undefined,
    async (update) => {
      selectListByIdWithItems(listId!!).then((r) => {
        if (r.ok) {
          update(r.data);
        }
      });
    },
    [listId]
  );

  const items = useMemo<ContentItem[]>(() => {
    return list?.listitem?.map((item) => {

        const isMovie = item.movie_id !== -1
        const id = isMovie ? item.movie_id : item.show_id

        return {   
            isMovie: isMovie,
            id: id,
            name: item.title,
            description: item.description ?? "",
            favorite: (favorites.find((it) => it.id === id && it.isMovie === isMovie) !== undefined),
            posterUrl: item.poster_path,   
        } satisfies ContentItem
    }) ?? []
  }, [list, favorites])

  const previewImages = (items.slice(0, 4).map((it) => it.posterUrl).filter((it) => it !== undefined)) ?? []

  if (list === undefined) {
    return <div>Loading...</div>;
  }

  if (list.user_id === user?.user_id) {
    
  }

  console.log(previewImages, "IMGAES")
  return (
    <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto relative">
        <ListHeader
            total_items={items.length}
            title={list.name}
            description={list.description}
            createdBy={list.user_id}
            images={previewImages}
            onDelete={() => deleteList(list.list_id).then(() => navigate('/home'))}
        ></ListHeader>

      <div className="grid lg:grid-cols-5 sm:grid-cols-2 gap-4 w-full">
        {items.map((item) => {
          return (
            <ContentListItem className="w-full h-[300px] max-h-[300px]"
              key={"list_"+item.id}
              favorite={item.favorite}
              contentId={item.id}
              description={item.description}
              isMovie={item.isMovie}
              title={item.name}
              posterUrl={item.posterUrl ?? ""}
            />
          );
        })}
      </div>
    </div>
  );
};

function ListHeader({
  total_items,
  images,
  title,
  createdBy,
  description,
  onDelete
}: {
  total_items : number;
  images: string[];
  title: string;
  createdBy: string;
  description: string;
  onDelete: () => void;
}) {
  const [usersList, setUserList] = useState<boolean>(false)
  const user = useUserStore(useShallow((state) => state.userdata?.stored));

  if(createdBy === user?.user_id){
    setUserList(true)
  }
  return (
    <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto relative">
      <div className="flex items-center justify-between w-full mb-8">
        <div className="relative w-40 h-40 flex-shrink-0">
          {(images?.length ?? 0) > 3 ? (
            <ImageGrid images={images} />
          ) : (
            <img
              src={images[0] ?? defualt_movie_poster}
              alt=""
              className="w-full h-full object-cover rounded-md shadow-lg"
            />
          )}
        </div>

        <div className="ml-8 flex flex-col justify-between flex-grow">
          <p className="text-5xl font-bold text-gray-800 mb-2">{title}</p>
          <p className="text-xl text-gray-500 mb-4">
            {`Created by ${createdBy} - ${total_items} items`}
          </p>
          <p className="text-xl text-gray-500 mb-4">
            {description}
          </p>
        </div>
        {usersList === true ? <button
          className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-200 text-black rounded-md p-2 shadow-sm focus:outline-none"
          onClick={onDelete}
        >
          Delete List
        </button> : <div/>}
      </div>
    </div>
  );
}

export default ListViewPage;
