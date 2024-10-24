import { createClient, Session, User } from '@supabase/supabase-js'
import { Database } from './supabase'
import { ListItem, ListWithItems } from './userstore';
import { showBoxProp } from '@/components/Showbox';
import { movieBoxProp } from '@/components/Moviebox';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
    'https://ghasvemjqkfxpkkafnbg.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoYXN2ZW1qcWtmeHBra2FmbmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU0NTg3MzIsImV4cCI6MjAyMTAzNDczMn0.6b_ouVg6R7ubRh6N96qSfJBzr8MNlgRLWAdiJFNoyXw'
);

export type StoredUser = {
    email: string;
    favorites_public: boolean;
    profile_image: string | null;
    user_id: string;
    username: string;
}


export type ListWithPostersRpcResponse = {
    created_at: string,
    description: string,
    list_id: string,
    name: string,
    public: boolean,
    updated_at?: string,
    user_id: string,
    username: string,
    profile_image?: string,
    ids: string[]
    total?: number
}



export function contentFrom(data: ListWithPostersRpcResponse) {
    return data.ids?.map((it) => {
        const split = it.split(',')

        const showId = split[0]
        const movieId = split[1]

        const isMovie = movieId !== "-1"

        return {
           isMovie: isMovie,
           movidId: isMovie ? movieId : showId,
           url:  split[split.length - 1]
        }
    })
}

export async function supabaseSignOut(): Promise<boolean> {
    try {
        supabase.auth.signOut()
        return true
    } catch {
        return false
    }
}

export async function getListWithPosters(
    type:  "select_most_recent_lists_with_poster_items" | "select_most_popular_lists_with_poster_items",
    limit: number,
    offset: number,
) {
    try {
        const res = await supabase.rpc(type, { lim: limit, off: offset})
        .select()
        return res.data! as ListWithPostersRpcResponse[]
    } catch{}
    return null
}

export function getProfileImageUrl(
    path: string,
    options?: {
        download?: string | boolean;
        transform?: {
            width?: number,
            height?: number
        }
    }
): string | undefined {
    return supabase.storage.from('profile_pictures').getPublicUrl(path, options).data.publicUrl
}

export async function getUserProfileImagePath(userId: string): Promise<string | null> {
    try {
        const res = await supabase.from("users").select("profile_image").filter("user_id", "eq", userId).limit(1)
        return res.data![0].profile_image
    } catch {
        return null
    }
}

export async function getUserById(id: string): Promise<StoredUser | null> {
    try {
        const res = await supabase.from("users")
            .select()
            .filter("user_id", "eq", id)
            .limit(1)
            .order("user_id", { ascending: true })

        return res.data![0]
    } catch{}
    return null
}

export async function signInWithEmailAndPassword(email: string, password: string): Promise<{user: User, session: Session} | null> {
    try {
        const result = await supabase.auth.signInWithPassword({
            email: email,
            password: password
         })
         if (result.data.user && result.data.session) {
            return result.data
         }
     } catch {}
     return null
 }


export async function selectListsByUserId(userId: string): Promise<ListWithItems[] | null> {
    try {
        const res = await supabase
            .from("userlist")
            .select("*, listitem(*)")
            .filter("user_id", "eq", userId)
        
        return res.data as ListWithItems[] | null
    } catch(e) {}    
    return null
}

export async function selectListsByIdsWithPoster(userId: string | undefined): Promise<ListWithPostersRpcResponse[]>{
    if (userId == undefined)
        return []

    const {data} = await supabase.rpc(
        "select_lists_with_poster_items_for_user_id",
        {
            uid: userId,
            lim: 9999,
            off: 0
        })
    return data as unknown as ListWithPostersRpcResponse[]
}

export async function selectListByListIDwithPoster(listId: string): Promise<ListWithPostersRpcResponse> {
    const { data, error } = await supabase.rpc("select_lists_by_ids_with_poster", {
        list_ids: `{${listId}}`// Pass as an array
    })

    if (error) {
        console.error("Supabase RPC error:", error)
        throw new Error("Network response was not ok: " + error.message)
    } else {
        return data as unknown as ListWithPostersRpcResponse
    }
}



export async function selectListByID(listID : string) : Promise<ListItem[] | null> {
    const {data, error} = await supabase.from("listitem").select("*").eq("list_id", listID)
    if (error) {
        console.log(error)
        return null
    }else {

        return data as unknown as ListItem[]
    }

}

export async function addToListByID(listID : string, movie: movieBoxProp | undefined, show: showBoxProp | undefined, client : StoredUser | null) {
    if (show === undefined) {
        const {data, error} = await supabase.from("listitem").insert({
            "list_id" : listID,
            "movie_id" : movie!!.item.id,
            "show_id" : -1,
            "user_id" : client?.user_id,
            "poster_path" : movie?.item.poster_path.slice(1, movie.item.poster_path.length),
            "title" : movie?.item.title,
            "description" : movie?.item.overview,
         
        })
        if(error) {
            console.log(error)
        }else{
            return data
        }
    }else{
        const {data, error} = await supabase.from("listitem").insert({
            "list_id" : listID,
            "movie_id" : -1,
            "show_id" : show.item.id,
            "user_id" : client?.user_id,
            "poster_path" : show.item.poster_path.slice(1, show.item.poster_path.length),
            "title" : show.item.name,
            "description" : show.item.overview,
        })
        if(error) {
            console.log(error)
        }else{
            return data
        }
    }
    
}   