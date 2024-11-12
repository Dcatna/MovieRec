import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import {
  getUserById,
  ListWithPostersRpcResponse,
  selectListByIdWithItems,
  selectListsByIdsWithPoster,
  selectListsByIdWithPosters,
  selectListsByUserId,
  signInWithEmailAndPassword,
  StoredUser,
  supabase,
} from "./supabase-client";
import { failureResult, Result, successResult } from "@/lib/utils";

export type ListItem = {
  list_id: string;
  user_id: string;
  movie_id: number;
  show_id: number;
  poster_path: string | undefined;
  title: string;
  description: string | undefined;
  created_at: string;
};

export type ListWithItems = {
  list_id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string | undefined;
  public: Boolean;
  subscribers: number;
  listitem: ListItem[] | undefined;
};

export type UserList = {
  list_id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string | undefined;
  public: Boolean;
  subscribers: number;
}

type UserData = {
  user: User;
  stored: StoredUser;
}

export type ContentItem = { 
  isMovie: boolean,
  id: number,
  name: string,
  description: string,
  favorite: boolean,
  posterUrl: string | undefined,
}

export interface UserStore {
  userdata: UserData | undefined;
  lists: ListWithPostersRpcResponse[];
  favorites: ContentItem[];
  signIn: (email: string, password: string) => Promise<boolean>;
  refreshUserLists: () =>  Promise<void>;
  refreshUser: () =>  Promise<void>;
  refreshFavorites: () =>  Promise<void>;
  signOut: () => Promise<void>
  init: () => () => void 
  toggleItemFavorite: (item: ContentItem) => Promise<void>
  createList: (name: string, description: string, pub: boolean) => Promise<void>
}


export const useUserStore = create<UserStore>((set, get) => ({
  userdata: undefined,
  lists: [],
  favorites: [],
  init: () => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(event, session)

        if (event === 'INITIAL_SESSION') {
          // handle initial session
        } else if (event === 'SIGNED_IN') {
          // handle sign in event
          get().refreshUser().then(() => {
            get().refreshUserLists()
            get().refreshFavorites()
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            userdata: undefined,
            lists: [],
            favorites: []
          })
        } else if (event === 'PASSWORD_RECOVERY') {
          // handle password recovery event
        } else if (event === 'TOKEN_REFRESHED') {
          // handle token refreshed event
        } else if (event === 'USER_UPDATED') {
          // handle user updated event
          get().refreshUser()
        }
      })


      initializeUser().then((result) => {
        if (!result.ok) {
          return data.subscription.unsubscribe
        }
  
        set({
          userdata: result.data
        })
  
        get().refreshFavorites()
        get().refreshUserLists()
      })

      return data.subscription.unsubscribe
  },
  refreshUserLists: async() => {
      const userId = get().userdata?.user.id
      if (!userId) {
        return 
      }

      const result = await selectListsByIdsWithPoster(userId)
      if (!result.ok) {
        return
      }

      set({
        lists: result.data
      })
  },
  refreshFavorites: async () => {
    const id = get().userdata?.user?.id
    if (!id) {
      return
    }
    const { data, error } = await supabase.from("favoritemovies").select("*").eq("user_id", id)
    if (error) {
      return
    }
    set({
      favorites: data.map((d) => {
        return { 
          id: d.movie_id !== -1 ? d.movie_id : d.show_id,
          isMovie: (d.movie_id !== -1),
          favorite: true,
          description: (d.overview ?? ""), 
          name: (d.title ?? ""),
          posterUrl: d.poster_path ?? undefined
        }
      })
    })
  },
  refreshUser: async() => {
    const {data, error} = await supabase.auth.getUser()
    if (error) {
      return
    }
    const id = data.user?.id
    if (!id) {
      return
    }
    const stored = await getUserById(id)
    if (!stored.ok) {
      return 
    }

    set({
        userdata: {
          user: data.user,
          stored: stored.data
        }
    })
  },
  signOut: async () => {
    supabase.auth.signOut({})
  },
  signIn: async (email, password) => { 
    const result = await signInWithEmailAndPassword(email, password)
    return result.ok 
  },
  toggleItemFavorite: async (item) => {
    if (item.favorite) {
      supabase.from("favoritemovies").delete().eq(item.isMovie ? "movie_id" : "show_id", item.id)
    } else {
      supabase.from("favoritemovies").insert(
        {
          movie_id: item.isMovie ? item.id : -1,
          show_id: item.isMovie ? -1 : item.id,
          title: item.name,
          overview: item.description,
          poster_path: item.posterUrl
        }
      )
    }
  },
  createList: async (name: string, description: string, pub: boolean) => {
      const user = get().userdata?.user
      if (!user) {
        return
      }
      const {error} = await supabase.from("userlist").insert({
          name: name,
          public: pub,
          description: description,
          user_id: user.id
      })
      if (error) {
          return 
      }
      get().refreshUserLists()
  }
}))



async function initializeUser(): Promise<Result<UserData, any>> {
 
  const user = await supabase.auth.getUser()

  if (user.error) {
    return failureResult(user.error)
  }

  const stored = await getUserById(user.data.user.id)

  if (!stored.ok) {
    return failureResult(stored.error)
  }

  return successResult(
    {
      user: user.data.user,
      stored: stored.data
    }
  )
}