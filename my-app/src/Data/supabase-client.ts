import { createClient, User } from "@supabase/supabase-js";
import { Database } from "./supabase";
import { ListItem, ListWithItems } from "./userstore";
import { ContentItemProps } from "@/components/Moviebox";
import { favs } from "@/types/types";
import { ShowListResult } from "@/types/MovieListResponse";
import { CommentType } from "@/components/CommentBox";
import { failureResult, Result, successResult } from "@/lib/utils";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  "https://ghasvemjqkfxpkkafnbg.supabase.co",
  import.meta.env.VITE_SUPABASE_API_KEY
);

export type StoredUser = {
  email: string;
  favorites_public: boolean;
  profile_image: string | null;
  user_id: string;
  username: string;
};

export type ListWithPostersRpcResponse = {
  list_id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  description: string;
  public: boolean;
  username: string;
  profile_image?: string;
  ids: string[];
  total?: number;
};

export function contentFrom(data: ListWithPostersRpcResponse) {
  return data.ids?.map((it) => {
    const split = it.split(",");

    if (split.length !== 3) {
      return undefined
    }

    const showId = split[0];
    const movieId = split[1];

    const isMovie = movieId !== "-1";

    return {
      isMovie: isMovie,
      movidId: isMovie ? movieId : showId,
      url: split[2],
    };
  }).filter(it => it !== undefined);
}

export async function supabaseSignOut(): Promise<boolean> {
  try {
    supabase.auth.signOut();
    return true;
  } catch {
    return false;
  }
}

export async function getListWithPosters(
  type:
    | "select_most_recent_lists_with_poster_items"
    | "select_most_popular_lists_with_poster_items",
  limit: number,
  offset: number
) {
  try {
    const res = await supabase.rpc(type, { lim: limit, off: offset }).select();
    return res.data! as ListWithPostersRpcResponse[];
  } catch {
    return null;
  }
}

export function getProfileImageUrl(
  path: string,
  options?: {
    download?: string | boolean;
    transform?: {
      width?: number;
      height?: number;
    };
  }
): string | undefined {
  return supabase.storage.from("profile_pictures").getPublicUrl(path, options)
    .data.publicUrl;
}

export async function getUserProfileImagePath(
  userId: string
): Promise<string | null> {
  try {
    const res = await supabase
      .from("users")
      .select("profile_image")
      .filter("user_id", "eq", userId)
      .limit(1);
    return res.data![0].profile_image;
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<Result<StoredUser, any>> {
  try {
    const res = await supabase
      .from("users")
      .select()
      .filter("user_id", "eq", id)
      .limit(1)
      .order("user_id", { ascending: true });

    return successResult(res.data![0]);
  } catch(e) {
    return failureResult(e);
  }
}

export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<Result<User, any>> {
  try {
    const {data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return failureResult(error)
    }
    return successResult(data.user)
  } catch(e) {
      return failureResult(e)
  }
}

export async function selectListByIdWithItems(
  listId: string
): Promise<Result<ListWithItems, any>> {
  try {
    const { data, error } = await supabase
      .from("userlist")
      .select("*, listitem(*)")
      .eq("list_id", listId)

    if (error) {
      return failureResult(error);
    }

    return successResult(data[0] as ListWithItems);
  } catch (e) {
    return failureResult(e);
  }
}

export async function selectListsByUserId(
  userId: string | undefined
): Promise<Result<ListWithItems[], any>> {
  try {
    const res = await supabase
      .from("userlist")
      .select("*, listitem(*)")
      .filter("user_id", "eq", userId);

    return successResult(res.data as ListWithItems[]);
  } catch (e) {
    return failureResult(e);
  }
}

export async function selectListsByIdsWithPoster(
  userId: string | undefined
): Promise<Result<ListWithPostersRpcResponse[], any>> {
  if (userId === undefined) {
    return failureResult(new Error("user id was not set"));
  }

  try {
    const { data, error } = await supabase.rpc(
      "select_lists_with_poster_items_for_user_id",
      {
        uid: userId,
        lim: 9999,
        off: 0,
      }
    );
    if (error) {
      return failureResult(error);
    }
    return successResult(data);
  } catch (e) {
    return failureResult(e);
  }
}

export async function selectListsByIdWithPosters(
  listId: string
): Promise<Result<ListWithPostersRpcResponse[], any>> {
  try {
    const { data, error } = await supabase.rpc(
      "select_lists_by_ids_with_poster",
      {
        list_ids: `{${listId}}`, // Pass as an array
      }
    );
    if (error) {
      return failureResult(error);
    }
    return successResult(data);
  } catch (e) {
    return failureResult(e);
  }
}

export async function selectListByID(
  listId: string
): Promise<ListItem[] | null> {
  const { data, error } = await supabase
    .from("listitem")
    .select("*")
    .eq("list_id", listId);
  if (error) {
    console.log(error);
    return null;
  } else {
    return data as unknown as ListItem[];
  }
}

export async function addToListByID(
  listID: string,
  movie: ContentItemProps | undefined,
  show: ShowListResult | undefined,
  client: StoredUser | null
) {
  const partial_url = "https://image.tmdb.org/t/p/original/";

  // //console.log(partial_url +movie?.item.poster_path.slice(1, movie.item.poster_path.length), "POSTER")
  // if (show === undefined) {
  //   const { data, error } = await supabase.from("listitem").insert({
  //     list_id: listID,
  //     movie_id: movie!!.item.id,
  //     show_id: -1,
  //     user_id: client?.user_id,
  //     poster_path:
  //       partial_url +
  //       movie?.item.poster_path.slice(1, movie.item.poster_path.length),
  //     title: movie?.item.title,
  //     description: movie?.item.overview,
  //   });
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     return data;
  //   }
  // } else {
  //   const { data, error } = await supabase.from("listitem").insert({
  //     list_id: listID,
  //     movie_id: -1,
  //     show_id: show!!.id,
  //     user_id: client?.user_id,
  //     poster_path:
  //       partial_url + show.poster_path.slice(1, show.poster_path.length),
  //     title: show.name,
  //     description: show.overview,
  //   });
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     return data;
  //   }
  // }
}

export async function getFavoritedMoviesByUser(): Promise<favs[] | null> {
  const { data, error } = await supabase
    .from("favoritemovies")
    .select("*")
    .neq("movie_id", -1);
  if (error) {
    console.log(error);
    return null;
  }

  return data as unknown as favs[];
}

export async function getFavoritedShowsByUser(): Promise<favs[] | null> {
  const { data, error } = await supabase
    .from("favoritemovies")
    .select("*")
    .neq("show_id", -1);
  if (error) {
    console.log(error);
    return null;
  }
  return data as unknown as favs[];
}

export async function getRecentMovieFavorites(): Promise<favs[] | null> {
  const { data, error } = await supabase
    .from("favoritemovies")
    .select("*")
    .neq("movie_id", -1)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    console.log(error);
  }

  return data as unknown as favs[];
}

export async function getRecentShowFavorites(): Promise<favs[] | null> {
  const { data, error } = await supabase
    .from("favoritemovies")
    .select("*")
    .neq("show_id", -1)
    .order("created_at", { ascending: false })
    .limit(15);
  if (error) {
    console.log(error);
  }

  return data as unknown as favs[];
}

export async function getComments(
  movie_id: number,
  show_id: number
): Promise<CommentType[]> {
  const { data, error } = await supabase.rpc(
    "select_comments_for_content_with_info",
    // @ts-ignore
    { uid: null, lim: 9999, off: 0, mid: movie_id, sid: show_id } 
  );
  if (error) {
    throw error;
  } else {
    return data;
  }
}

export async function insertComment(
  movie_id: number,
  show_id: number,
  user_id: string,
  created: string,
  comment: string
) {
  if (movie_id != -1) {
    const { error } = await supabase.from("comment").insert({
      user_id: user_id,
      created_at: created,
      message: comment,
      movie_id: movie_id,
      show_id: -1,
    });

    if (error) {
      console.log(error.details);
      return;
    }
  } else {
    const { error } = await supabase.from("comment").insert({
      user_id: user_id,
      created_at: created,
      message: comment,
      movie_id: -1,
      show_id: show_id,
    });

    if (error) {
      console.log(error);
      return;
    }
  }
}

export async function insertReply(
  date: string,
  user_id: string,
  currComment: string,
  activeReply: number
) {
  const { error } = await supabase.from("reply").insert({
    created_at: date,
    user_id: user_id,
    message: currComment,
    cid: activeReply,
  });

  if (error) {
    console.log(error);
    return;
  }
}

export async function getLikes(comment_id: number): Promise<number> {
  const { data, error } = await supabase
    .from("clikes")
    .select("*", { count: "exact" })
    .eq("cid", comment_id);
  if (error) {
    throw error;
  }
  return data.length;
}

export async function getUserLikedComment(
  comment_id: number,
  user_id: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("clikes")
    .select("*")
    .eq("user_id", user_id)
    .eq("cid", comment_id);
  if (error) {
    throw error;
  }
  return data.length > 0;
}

export async function removeLikeByUser(comment_id: number, user_id: string) {
  const { error } = await supabase
    .from("clikes")
    .delete()
    .eq("cid", comment_id)
    .eq("user_id", user_id);
  if (error) {
    throw error;
  }
}

export async function insertLikeByUser(comment_id: number, user_id: string) {
  const { error } = await supabase.from("clikes").insert({
    cid: comment_id,
    user_id: user_id,
  });
  if (error) {
    throw error;
  }
}

export async function deleteListById(list_id: string) {
  const { error } = await supabase
    .from("userlist")
    .delete()
    .match({ list_id: list_id });
  if (error) {
    throw error;
  } else {
    return 0;
  }
}

export async function publicToggleByListId(list_id: string) {
  const { data, error } = await supabase
    .from("userlist")
    .select("public")
    .eq("list_id", list_id)
    .single();

  if (error) {
    throw error;
  } else {
    const currentStatus = data.public;
    const newStatus = !currentStatus;

    const { error: updateError } = await supabase
      .from("userlist")
      .update({ public: newStatus })
      .eq("list_id", list_id);

    if (updateError) {
      throw updateError;
    } else {
      return 0;
    }
  }
}
