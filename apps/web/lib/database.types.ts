export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SportType =
  | "football"
  | "basketball"
  | "volleyball"
  | "handball"
  | "running"
  | "fitness"
  | "tennis"
  | "swimming"
  | "martial_arts"
  | "esports"
  | "other";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
        };
        Relationships: [];
      };
      athlete_marketplace_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          bio: string | null;
          photo_url: string | null;
          sport_interests: SportType[] | null;
          goals: string | null;
          timezone: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name: string;
          bio?: string | null;
          photo_url?: string | null;
          sport_interests?: SportType[] | null;
          goals?: string | null;
          timezone?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          bio?: string | null;
          photo_url?: string | null;
          sport_interests?: SportType[] | null;
          goals?: string | null;
          timezone?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
