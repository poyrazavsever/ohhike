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
      coach_marketplace_profiles: {
        Row: {
          id: string;
          organization_id: string;
          coach_user_id: string;
          slug: string;
          display_name: string;
          headline: string | null;
          bio: string | null;
          photo_url: string | null;
          specialties: string[] | null;
          sports: SportType[] | null;
          coaching_modes: string[] | null;
          languages: string[] | null;
          location_country: string | null;
          location_city: string | null;
          years_experience: number | null;
          pricing_display: string | null;
          response_time_avg_hours: number | null;
          is_public: boolean;
          is_accepting_clients: boolean;
          average_rating: number | null;
          review_count: number;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      coaching_packages: {
        Row: {
          id: string;
          coach_profile_id: string;
          title: string;
          description: string | null;
          duration_weeks: number | null;
          price_cents: number | null;
          currency: string;
          is_active: boolean;
          sort_order: number;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
