export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          name: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          color: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      daily_goals: {
        Row: {
          created_at: string;
          goal_date: string;
          id: string;
          target_days_per_week: number;
          target_focus_minutes: number;
          target_sessions: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          goal_date?: string;
          id?: string;
          target_days_per_week?: number;
          target_focus_minutes?: number;
          target_sessions?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          goal_date?: string;
          id?: string;
          target_days_per_week?: number;
          target_focus_minutes?: number;
          target_sessions?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          actual_minutes: number | null;
          break_minutes: number;
          category_id: string | null;
          created_at: string;
          difficulty: string | null;
          ended_at: string | null;
          focus_minutes: number;
          id: string;
          memo: string | null;
          planned_minutes: number;
          self_rating: number | null;
          started_at: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          actual_minutes?: number | null;
          break_minutes?: number;
          category_id?: string | null;
          created_at?: string;
          difficulty?: string | null;
          ended_at?: string | null;
          focus_minutes?: number;
          id?: string;
          memo?: string | null;
          planned_minutes?: number;
          self_rating?: number | null;
          started_at: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          actual_minutes?: number | null;
          break_minutes?: number;
          category_id?: string | null;
          created_at?: string;
          difficulty?: string | null;
          ended_at?: string | null;
          focus_minutes?: number;
          id?: string;
          memo?: string | null;
          planned_minutes?: number;
          self_rating?: number | null;
          started_at?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          created_at: string;
          default_break_minutes: number;
          default_focus_minutes: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          default_break_minutes?: number;
          default_focus_minutes?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          default_break_minutes?: number;
          default_focus_minutes?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
