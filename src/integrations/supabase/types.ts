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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          date: string
          id: string
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          date: string
          id?: string
          status: string
          student_id: string
          teacher_id: string
        }
        Update: {
          date?: string
          id?: string
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          is_used: boolean
          kindergarten_id: string
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          is_used?: boolean
          kindergarten_id: string
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          is_used?: boolean
          kindergarten_id?: string
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_kindergarten_id_fkey"
            columns: ["kindergarten_id"]
            isOneToOne: false
            referencedRelation: "kindergartens"
            referencedColumns: ["id"]
          },
        ]
      }
      kindergartens: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      message_deliveries: {
        Row: {
          channel: string
          created_at: string
          id: string
          message_body: string
          parent_id: string
          provider_message_id: string | null
          report_id: string
          sent_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          message_body?: string
          parent_id: string
          provider_message_id?: string | null
          report_id: string
          sent_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message_body?: string
          parent_id?: string
          provider_message_id?: string | null
          report_id?: string
          sent_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_deliveries_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_deliveries_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "parent_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_deliveries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_reports: {
        Row: {
          action_plan: Json
          analysis_summary: string
          created_at: string
          id: string
          locale: string
          parent_message: string
          student_id: string
          survey_id: string
          teacher_id: string
        }
        Insert: {
          action_plan?: Json
          analysis_summary?: string
          created_at?: string
          id?: string
          locale?: string
          parent_message?: string
          student_id: string
          survey_id: string
          teacher_id: string
        }
        Update: {
          action_plan?: Json
          analysis_summary?: string
          created_at?: string
          id?: string
          locale?: string
          parent_message?: string
          student_id?: string
          survey_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_reports_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          kindergarten_id: string | null
          school_name: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          kindergarten_id?: string | null
          school_name?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          kindergarten_id?: string | null
          school_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_kindergarten_id_fkey"
            columns: ["kindergarten_id"]
            isOneToOne: false
            referencedRelation: "kindergartens"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          parent_id: string
          relationship: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          parent_id: string
          relationship?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          parent_id?: string
          relationship?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: number
          created_at: string | null
          gender: string
          id: string
          kindergarten_id: string | null
          name: string
          teacher_id: string
        }
        Insert: {
          age: number
          created_at?: string | null
          gender: string
          id?: string
          kindergarten_id?: string | null
          name: string
          teacher_id: string
        }
        Update: {
          age?: number
          created_at?: string | null
          gender?: string
          id?: string
          kindergarten_id?: string | null
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_kindergarten_id_fkey"
            columns: ["kindergarten_id"]
            isOneToOne: false
            referencedRelation: "kindergartens"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          analysis: Json | null
          answers: Json
          date: string | null
          id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          analysis?: Json | null
          answers?: Json
          date?: string | null
          id?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          analysis?: Json | null
          answers?: Json
          date?: string | null
          id?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_kindergarten_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_invite_code: {
        Args: { _code: string; _user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "kg_admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "teacher", "kg_admin"],
    },
  },
} as const
