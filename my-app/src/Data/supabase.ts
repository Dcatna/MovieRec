export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clikes: {
        Row: {
          cid: number
          user_id: string
        }
        Insert: {
          cid: number
          user_id?: string
        }
        Update: {
          cid?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clikes_cid_fkey"
            columns: ["cid"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clikes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comment: {
        Row: {
          created_at: string
          id: number
          message: string
          movie_id: number
          show_id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string
          movie_id?: number
          show_id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          movie_id?: number
          show_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      favoritemovies: {
        Row: {
          _id: number
          movie_id: number
          overview: string | null
          poster_path: string | null
          show_id: number
          title: string | null
          user_id: string | null
          vote_average: number | null
        }
        Insert: {
          _id?: number
          movie_id?: number
          overview?: string | null
          poster_path?: string | null
          show_id?: number
          title?: string | null
          user_id?: string | null
          vote_average?: number | null
        }
        Update: {
          _id?: number
          movie_id?: number
          overview?: string | null
          poster_path?: string | null
          show_id?: number
          title?: string | null
          user_id?: string | null
          vote_average?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "favoritemovies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listitem: {
        Row: {
          created_at: string | null
          description: string
          list_id: string
          movie_id: number
          poster_path: string | null
          show_id: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string
          list_id?: string
          movie_id?: number
          poster_path?: string | null
          show_id?: number
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          description?: string
          list_id?: string
          movie_id?: number
          poster_path?: string | null
          show_id?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_listitem_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "userlist"
            referencedColumns: ["list_id"]
          },
          {
            foreignKeyName: "public_listitem_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reply: {
        Row: {
          cid: number
          created_at: string
          id: number
          message: string
          user_id: string | null
        }
        Insert: {
          cid: number
          created_at?: string
          id?: number
          message: string
          user_id?: string | null
        }
        Update: {
          cid?: number
          created_at?: string
          id?: number
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reply_cid_fkey"
            columns: ["cid"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reply_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription: {
        Row: {
          list_id: string
          user_id: string
        }
        Insert: {
          list_id: string
          user_id?: string
        }
        Update: {
          list_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_listSubscription_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "userlist"
            referencedColumns: ["list_id"]
          },
          {
            foreignKeyName: "public_listSubscription_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      userlist: {
        Row: {
          created_at: string
          description: string
          list_id: string
          name: string
          public: boolean
          subscribers: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          list_id?: string
          name?: string
          public?: boolean
          subscribers?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          list_id?: string
          name?: string
          public?: boolean
          subscribers?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_userlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          favorites_public: boolean
          profile_image: string | null
          user_id: string
          username: string
        }
        Insert: {
          email?: string
          favorites_public?: boolean
          profile_image?: string | null
          user_id?: string
          username?: string
        }
        Update: {
          email?: string
          favorites_public?: boolean
          profile_image?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deleteUser: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      select_comments_for_content_with_info: {
        Args: {
          uid: string
          mid: number
          sid: number
          lim: number
          off: number
        }
        Returns: {
          id: number
          created_at: string
          user_id: string
          message: string
          movie_id: number
          show_id: number
          profile_image: string
          username: string
          likes: number
          user_liked: boolean
          replies: number
          total: number
        }[]
      }
      select_lists_by_ids_with_poster: {
        Args: {
          list_ids: string
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          username: string
          profile_image: string
          ids: string[]
        }[]
      }
      select_lists_with_poster_items_for_query: {
        Args: {
          query: string
          off: number
          lim: number
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          username: string
          profile_image: string
          ids: string[]
          total: number
        }[]
      }
      select_lists_with_poster_items_for_user_id: {
        Args: {
          uid: string
          off: number
          lim: number
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          username: string
          profile_image: string
          ids: string[]
          total: number
        }[]
      }
      select_most_popular_lists_with_poster_items: {
        Args: {
          lim: number
          off: number
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          username: string
          profile_image: string
          ids: string[]
          total: number
        }[]
      }
      select_most_recent_lists_with_poster_items: {
        Args: {
          lim: number
          off: number
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          username: string
          profile_image: string
          ids: string[]
          total: number
        }[]
      }
      select_recommended_by_subscriptions: {
        Args: {
          uid: string
          lim: number
          off: number
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          username: string
          profile_image: string
          ids: string[]
          total: number
        }[]
      }
      select_subscribed_lists_with_items: {
        Args: {
          uid: string
        }
        Returns: {
          list_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          public: boolean
          description: string
          subscribers: number
          movie_id: number
          show_id: number
        }[]
      }
      select_top_comments_for_content_with_info: {
        Args: {
          uid: string
          mid: number
          sid: number
          lim: number
          off: number
        }
        Returns: {
          id: number
          created_at: string
          user_id: string
          message: string
          movie_id: number
          show_id: number
          profile_image: string
          username: string
          likes: number
          user_liked: boolean
          replies: number
          total: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
