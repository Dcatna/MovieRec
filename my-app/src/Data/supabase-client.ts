import { createClient, Session, User } from '@supabase/supabase-js'
import { Database } from './supabase'
import { ListWithItems } from './userstore';

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
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