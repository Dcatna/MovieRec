import { Cast } from "@/types/types";
import user_image from './user_default.jpg'

interface movieactor {
    actor: Cast;
}

const ActorBox = ({ actor } : movieactor) => {
    const imageUrl = actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : user_image;

    return (
        <div className="flex flex-col items-center w-24 h-36 mx-2">
            <div className="w-24 h-24 overflow-hidden rounded-md">
                <img src={imageUrl} alt="Actor Picture" className="object-cover w-full h-full" />
            </div>
            <p className="mt-2 text-center text-sm">{actor.name}</p>
        </div>
    );
};

export default ActorBox