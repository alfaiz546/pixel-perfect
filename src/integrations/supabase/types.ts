export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          category: string
          created_at: string
          description: string
          email: string | null
          id: string
          rating: number | null
          ref: string
          subject: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          email?: string | null
          id?: string
          rating?: number | null
          ref?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          rating?: number | null
          ref?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hire_requests: {
        Row: {
          budget: string | null
          city: string
          created_at: string
          description: string | null
          hirer_id: string
          id: string
          kind: string
          preferred_date: string | null
          roles: Json
          status: string
          title: string
          worker_id: string | null
        }
        Insert: {
          budget?: string | null
          city: string
          created_at?: string
          description?: string | null
          hirer_id: string
          id?: string
          kind?: string
          preferred_date?: string | null
          roles?: Json
          status?: string
          title: string
          worker_id?: string | null
        }
        Update: {
          budget?: string | null
          city?: string
          created_at?: string
          description?: string | null
          hirer_id?: string
          id?: string
          kind?: string
          preferred_date?: string | null
          roles?: Json
          status?: string
          title?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hire_requests_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          area: string | null
          budget: string | null
          city: string
          created_at: string
          description: string | null
          hire_type: string
          id: string
          is_sample: boolean
          posted_by: string | null
          skill: string
          timing: string | null
          title: string
        }
        Insert: {
          area?: string | null
          budget?: string | null
          city: string
          created_at?: string
          description?: string | null
          hire_type?: string
          id?: string
          is_sample?: boolean
          posted_by?: string | null
          skill: string
          timing?: string | null
          title: string
        }
        Update: {
          area?: string | null
          budget?: string | null
          city?: string
          created_at?: string
          description?: string | null
          hire_type?: string
          id?: string
          is_sample?: boolean
          posted_by?: string | null
          skill?: string
          timing?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      workers: {
        Row: {
          about: string | null
          area: string | null
          available: boolean
          avatar_url: string | null
          city: string
          created_at: string
          experience_years: number
          id: string
          is_sample: boolean
          languages: string[]
          name: string
          rate: string | null
          rating: number
          reviews_count: number
          skill: string
          tags: string[]
          team_available: boolean
          user_id: string | null
          verified_jobs: number
        }
        Insert: {
          about?: string | null
          area?: string | null
          available?: boolean
          avatar_url?: string | null
          city: string
          created_at?: string
          experience_years?: number
          id?: string
          is_sample?: boolean
          languages?: string[]
          name: string
          rate?: string | null
          rating?: number
          reviews_count?: number
          skill: string
          tags?: string[]
          team_available?: boolean
          user_id?: string | null
          verified_jobs?: number
        }
        Update: {
          about?: string | null
          area?: string | null
          available?: boolean
          avatar_url?: string | null
          city?: string
          created_at?: string
          experience_years?: number
          id?: string
          is_sample?: boolean
          languages?: string[]
          name?: string
          rate?: string | null
          rating?: number
          reviews_count?: number
          skill?: string
          tags?: string[]
          team_available?: boolean
          user_id?: string | null
          verified_jobs?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type: "worker" | "hirer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["worker", "hirer"],
    },
  },
} as const
