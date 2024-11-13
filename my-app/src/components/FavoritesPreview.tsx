
import { useUserStore } from '@/Data/userstore';
import { useShallow } from 'zustand/shallow';
import default_favs from './default_favorite_list.jpg';
import { useEffect } from 'react';
import ContentListItem from './ContentListItem';

const FavortiesPage = () => {

    const favorites = useUserStore(useShallow((state) => state.favorites));
    const user = useUserStore(useShallow((state) => state.userdata?.stored));
    const refreshFavorites = useUserStore(useShallow((state) => state.refreshFavorites));

    useEffect(() => {
        refreshFavorites()
    }, [])

    if (favorites === undefined) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-start p-8 bg-white shadow-md rounded-lg mx-auto">
            <div className="flex items-center justify-between w-full mb-8">
                <div className="w-40 h-40 flex-shrink-0 relative">
                    <img src={default_favs} className="w-full h-full object-cover rounded-md shadow-lg" />  
                </div>

                <div className="ml-8 flex flex-col justify-between flex-grow">
                    <p className="text-5xl font-bold text-gray-800 mb-2">
                        Favorites
                    </p>
                    <p className="text-xl text-gray-500 mb-4">
                        {`Created by ${user?.username} - ${favorites.length} items`}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 w-full">
                {favorites.map((item) => {
                    return (
                        <ContentListItem 
                            className="aspect-[2/3]"
                            key={`${item.isMovie}-${item.id}`}
                            favorite={true}
                            contentId={item.id}
                            description={item.description}
                            isMovie={item.isMovie}
                            title={item.name}
                            posterUrl={item.posterUrl ?? ""}
                        />
                    )
                })}
            </div>
        </div>
    );
};

export default FavortiesPage;
