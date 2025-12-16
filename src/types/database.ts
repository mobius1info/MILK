export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          role: 'user' | 'admin'
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          role?: 'user' | 'admin'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          role?: 'user' | 'admin'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitation_codes: {
        Row: {
          id: string
          code: string
          is_used: boolean
          used_by: string | null
          created_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          code: string
          is_used?: boolean
          used_by?: string | null
          created_at?: string
          used_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          is_used?: boolean
          used_by?: string | null
          created_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_used_by_fkey"
            columns: ["used_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
