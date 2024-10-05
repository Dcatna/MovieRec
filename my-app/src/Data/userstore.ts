import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import {
  getUserById,
  selectListsByUserId,
  signInWithEmailAndPassword,
  StoredUser,
  supabaseSignOut,
} from "./supabase-client";

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

export interface UserState {
  playlists: ListWithItems[];
  user: {
    user: User;
    session: Session;
  } | null;
  stored: StoredUser | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  refreshPlaylists: () => void;
  refreshUser: () => void;
  signOut: () => void
}

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") ?? "") as {
            user: User;
            session: Session;
        }
    } catch {
        return null
    }
}

const getStored = () => {
    try {
        return JSON.parse(localStorage.getItem("stored") ?? "") as StoredUser
    } catch {
        return null
    }
}

export const useUserStore = create<UserState>((set, get) => ({
  playlists: [],
  user: getStoredUser(),
  stored: getStored(),
  refreshPlaylists: async () => {
    const user = get().user;
    if (user) {
      const playlists = await selectListsByUserId(user.user.id);
      set((state) => ({
        playlists: playlists ?? state.playlists,
      }));
    }
  },
  refreshUser: async () => {
    const userId = get().user?.user?.id;
    if (userId) {
      const res = await getUserById(userId);
      localStorage.setItem("stored", JSON.stringify(res))
      set({ stored: res });
    }
  },
  signIn: async (email, password) => {
    const res = await signInWithEmailAndPassword(email, password).then(
      (user) => {
        localStorage.setItem("user", JSON.stringify(user))
        set({
          user: user,
        });
        get().refreshPlaylists();
        get().refreshUser();
        return user;
      }
    );
    return res != null;
  },
  signOut: async () => {
    supabaseSignOut().then((res) => {
      if (res) {
        localStorage.setItem("user", "")
        localStorage.setItem("stored", "")
        set({
          user: null,
          stored: null,
          playlists: []
        })
      }
    })
  }
}));
