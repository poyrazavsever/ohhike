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
          intro_video_url: string | null;
          training_philosophy: string | null;
          featured_result: string | null;
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
      coach_network_applications: {
        Row: {
          id: string;
          athlete_user_id: string;
          coach_profile_id: string;
          organization_id: string;
          status: string;
          athlete_message: string | null;
          coach_response: string | null;
          form_data: Json | null;
          submitted_at: string | null;
          created_at: string | null;
          conversation_id: string | null;
          package_id: string | null;
          athlete_marketplace_profile_id: string | null;
          coach_marketplace_profiles?: {
            id: string;
            slug: string;
            display_name: string;
            photo_url: string | null;
          } | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      marketplace_conversations: {
        Row: {
          id: string;
          conversation_type: string;
          organization_id: string | null;
          context_id: string | null;
          last_message_at: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      marketplace_conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
          participant_role: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      marketplace_messages: {
        Row: {
          id: string;
          conversation_id: string;
          organization_id: string | null;
          sender_user_id: string;
          body: string;
          message_type: string;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      teams: {
        Row: { id: string; organization_id: string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      athletes: {
        Row: {
          id: string;
          organization_id: string;
          team_id: string;
          user_id: string | null;
          first_name: string;
          last_name: string | null;
          display_name: string | null;
          email: string | null;
          source: string;
          marketplace_user_id: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      coach_network_offers: {
        Row: {
          id: string;
          application_id: string;
          organization_id: string;
          coach_user_id: string;
          athlete_user_id: string;
          title: string;
          description: string | null;
          terms: string | null;
          package_snapshot: Json | null;
          price_cents: number | null;
          currency: string;
          status: string;
          payment_status: string;
          sent_at: string | null;
          accepted_at: string | null;
          declined_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      remote_coaching_relationships: {
        Row: {
          id: string;
          organization_id: string;
          team_id: string | null;
          athlete_id: string | null;
          athlete_user_id: string;
          coach_user_id: string;
          coach_profile_id: string;
          status: string;
          payment_status: string;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      coach_reviews: {
        Row: {
          id: string;
          relationship_id: string;
          coach_profile_id: string;
          organization_id: string;
          athlete_user_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          is_public: boolean;
          moderated_at: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      coach_reputation_events: {
        Row: {
          id: string;
          coach_profile_id: string;
          organization_id: string;
          event_type: string;
          points_delta: number;
          reference_id: string | null;
          metadata: Json | null;
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
