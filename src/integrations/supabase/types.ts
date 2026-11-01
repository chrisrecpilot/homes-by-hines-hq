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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          enquiry_id: string | null
          id: string
          messages: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          enquiry_id?: string | null
          id: string
          messages?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          enquiry_id?: string | null
          id?: string
          messages?: Json
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string | null
          enquiry_type: string
          estimate_version_id: string | null
          follow_up_at: string | null
          id: string
          internal_notes: string
          lead_status: string
          message: string
          name: string
          next_action: string
          phone: string | null
          project_snapshot: Json | null
          request_type: string | null
          session_id: string | null
          site_address: string | null
          survey_at: string | null
          visit_preference: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          enquiry_type?: string
          estimate_version_id?: string | null
          follow_up_at?: string | null
          id?: string
          internal_notes?: string
          lead_status?: string
          message: string
          name: string
          next_action?: string
          phone?: string | null
          project_snapshot?: Json | null
          request_type?: string | null
          session_id?: string | null
          site_address?: string | null
          survey_at?: string | null
          visit_preference?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          enquiry_type?: string
          estimate_version_id?: string | null
          follow_up_at?: string | null
          id?: string
          internal_notes?: string
          lead_status?: string
          message?: string
          name?: string
          next_action?: string
          phone?: string | null
          project_snapshot?: Json | null
          request_type?: string | null
          session_id?: string | null
          site_address?: string | null
          survey_at?: string | null
          visit_preference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_estimate_version_id_fkey"
            columns: ["estimate_version_id"]
            isOneToOne: false
            referencedRelation: "estimate_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "estimating_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_actuals: {
        Row: {
          actual_person_days: number
          estimate_id: string
          labour_pence: number
          material_pence: number
          notes: string
          other_pence: number
          specialist_pence: number
          updated_at: string
        }
        Insert: {
          actual_person_days?: number
          estimate_id: string
          labour_pence?: number
          material_pence?: number
          notes?: string
          other_pence?: number
          specialist_pence?: number
          updated_at?: string
        }
        Update: {
          actual_person_days?: number
          estimate_id?: string
          labour_pence?: number
          material_pence?: number
          notes?: string
          other_pence?: number
          specialist_pence?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_actuals_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: true
            referencedRelation: "estimate_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_uploads: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          name: string
          session_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          name: string
          session_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          name?: string
          session_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_uploads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "estimating_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_versions: {
        Row: {
          created_at: string
          id: string
          pricing_snapshot: Json
          result: Json
          session_id: string
          specification: Json
        }
        Insert: {
          created_at?: string
          id?: string
          pricing_snapshot: Json
          result: Json
          session_id: string
          specification: Json
        }
        Update: {
          created_at?: string
          id?: string
          pricing_snapshot?: Json
          result?: Json
          session_id?: string
          specification?: Json
        }
        Relationships: [
          {
            foreignKeyName: "estimate_versions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "estimating_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      estimating_audit: {
        Row: {
          created_at: string
          id: string
          next_data: Json
          previous_data: Json | null
          record_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_data: Json
          previous_data?: Json | null
          record_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          next_data?: Json
          previous_data?: Json | null
          record_id?: string
          user_id?: string
        }
        Relationships: []
      }
      estimating_catalog: {
        Row: {
          data: Json
          id: string
          kind: string
          name: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          kind: string
          name: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          kind?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      estimating_sessions: {
        Row: {
          created_at: string
          id: string
          project_revision: number
          project_state: Json | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          id: string
          project_revision?: number
          project_state?: Json | null
          token_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          project_revision?: number
          project_state?: Json | null
          token_hash?: string
        }
        Relationships: []
      }
      estimating_settings: {
        Row: {
          id: number
          markup_percent: number
          sales_vat_percent: number
          tax_confirmed: boolean
          updated_at: string
          vat_registered: boolean | null
        }
        Insert: {
          id?: number
          markup_percent?: number
          sales_vat_percent?: number
          tax_confirmed?: boolean
          updated_at?: string
          vat_registered?: boolean | null
        }
        Update: {
          id?: number
          markup_percent?: number
          sales_vat_percent?: number
          tax_confirmed?: boolean
          updated_at?: string
          vat_registered?: boolean | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          path: string
          referrer: string | null
          source: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          path: string
          referrer?: string | null
          source?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          path?: string
          referrer?: string | null
          source?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_quote_enquiry: {
        Args: {
          p_address?: string
          p_email: string
          p_estimate: string
          p_message: string
          p_name: string
          p_phone: string
          p_preference?: string
          p_request: string
          p_session: string
          p_type: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
