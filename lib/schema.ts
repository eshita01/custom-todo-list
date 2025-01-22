export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number
          inserted_at: string | null // Make inserted_at optional
          is_complete: boolean | null
          task: string | null
          user_id: string
          due_date: string | null
          assigned_to: string | null
        }
        Insert: {
          id?: number
          inserted_at?: string | null // Make inserted_at optional
          is_complete?: boolean | null
          task?: string | null
          user_id: string
          due_date?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: number
          inserted_at?: string | null // Make inserted_at optional
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
          due_date?: string | null
          assigned_to?: string | null
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
