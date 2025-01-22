export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number
          inserted_at: string | null
          is_complete: boolean | null
          task: string | null
          user_id: string
          due_date: string | null
          assigned_to: string | null
        }
        Insert: {
          id?: number
          inserted_at?: string | null
          is_complete?: boolean | null
          task?: string | null
          user_id: string
          due_date?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: number
          inserted_at?: string | null
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
          due_date?: string | null
          assigned_to?: string | null
        }
      }
      notifications: { // Add the notifications table here
        Row: {
          id: number
          user_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
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
