export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrganizationType =
  | "club"
  | "academy"
  | "individual_coach"
  | "school_team"
  | "university_team"
  | "performance_center"
  | "other";

export type OrganizationRole =
  | "owner"
  | "admin"
  | "head_coach"
  | "assistant_coach"
  | "analyst"
  | "physiotherapist"
  | "nutritionist"
  | "athlete"
  | "viewer";

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

export type AthleteStatus =
  | "active"
  | "injured"
  | "recovery"
  | "inactive"
  | "monitoring";

export type TeamPlanTier = "basic_team" | "pro_team" | "pro_plus_team";

export type SessionType =
  | "team_training"
  | "personal_training"
  | "match"
  | "friendly_match"
  | "recovery"
  | "test_day"
  | "analysis_meeting"
  | "nutrition_session"
  | "education_session"
  | "other";

export type SessionStatus =
  | "draft"
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "analyzing"
  | "analysis_completed"
  | "analysis_failed";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          locale: string | null;
          timezone: string | null;
          last_active_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string | null;
          timezone?: string | null;
          last_active_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string | null;
          timezone?: string | null;
          last_active_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: OrganizationType;
          logo_url: string | null;
          country: string | null;
          city: string | null;
          billing_customer_id: string | null;
          is_self_hosted: boolean | null;
          settings: Json | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type?: OrganizationType;
          logo_url?: string | null;
          country?: string | null;
          city?: string | null;
          billing_customer_id?: string | null;
          is_self_hosted?: boolean | null;
          settings?: Json | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: OrganizationType;
          logo_url?: string | null;
          country?: string | null;
          city?: string | null;
          billing_customer_id?: string | null;
          is_self_hosted?: boolean | null;
          settings?: Json | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          is_active: boolean | null;
          invited_by: string | null;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: OrganizationRole;
          is_active?: boolean | null;
          invited_by?: string | null;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: OrganizationRole;
          is_active?: boolean | null;
          invited_by?: string | null;
          joined_at?: string | null;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          sport_type: SportType;
          age_group: string | null;
          level: string | null;
          default_formation: string | null;
          season_goal: string | null;
          weekly_training_count: number | null;
          settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          sport_type?: SportType;
          age_group?: string | null;
          level?: string | null;
          default_formation?: string | null;
          season_goal?: string | null;
          weekly_training_count?: number | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          sport_type?: SportType;
          age_group?: string | null;
          level?: string | null;
          default_formation?: string | null;
          season_goal?: string | null;
          weekly_training_count?: number | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      team_staff: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: OrganizationRole;
          assigned_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role: OrganizationRole;
          assigned_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: OrganizationRole;
          assigned_by?: string | null;
          created_at?: string | null;
        };
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
          phone: string | null;
          number: number | null;
          position: string | null;
          birth_date: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          dominant_side: string | null;
          status: AthleteStatus | null;
          notes: string | null;
          metadata: Json | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          team_id: string;
          user_id?: string | null;
          first_name: string;
          last_name?: string | null;
          display_name?: string | null;
          email?: string | null;
          phone?: string | null;
          number?: number | null;
          position?: string | null;
          birth_date?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          dominant_side?: string | null;
          status?: AthleteStatus | null;
          notes?: string | null;
          metadata?: Json | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          team_id?: string;
          user_id?: string | null;
          first_name?: string;
          last_name?: string | null;
          display_name?: string | null;
          email?: string | null;
          phone?: string | null;
          number?: number | null;
          position?: string | null;
          birth_date?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          dominant_side?: string | null;
          status?: AthleteStatus | null;
          notes?: string | null;
          metadata?: Json | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      athlete_invites: {
        Row: {
          id: string;
          athlete_id: string;
          organization_id: string;
          team_id: string;
          email: string | null;
          token: string;
          invited_by: string | null;
          accepted_by: string | null;
          expires_at: string | null;
          accepted_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          organization_id: string;
          team_id: string;
          email?: string | null;
          token: string;
          invited_by?: string | null;
          accepted_by?: string | null;
          expires_at?: string | null;
          accepted_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          organization_id?: string;
          team_id?: string;
          email?: string | null;
          token?: string;
          invited_by?: string | null;
          accepted_by?: string | null;
          expires_at?: string | null;
          accepted_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      team_billing_entitlements: {
        Row: {
          id: string;
          organization_id: string;
          team_id: string;
          plan: TeamPlanTier;
          max_team_members: number;
          ai_features_enabled: boolean;
          ai_reports_enabled: boolean;
          team_memory_enabled: boolean;
          training_planner_enabled: boolean;
          wearable_enabled: boolean;
          pdf_export_enabled: boolean;
          branded_reports_enabled: boolean;
          monthly_ai_report_limit: number;
          clerk_subscription_id: string | null;
          clerk_plan_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          team_id: string;
          plan?: TeamPlanTier;
          max_team_members?: number;
          ai_features_enabled?: boolean;
          ai_reports_enabled?: boolean;
          team_memory_enabled?: boolean;
          training_planner_enabled?: boolean;
          wearable_enabled?: boolean;
          pdf_export_enabled?: boolean;
          branded_reports_enabled?: boolean;
          monthly_ai_report_limit?: number;
          clerk_subscription_id?: string | null;
          clerk_plan_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          team_id?: string;
          plan?: TeamPlanTier;
          max_team_members?: number;
          ai_features_enabled?: boolean;
          ai_reports_enabled?: boolean;
          team_memory_enabled?: boolean;
          training_planner_enabled?: boolean;
          wearable_enabled?: boolean;
          pdf_export_enabled?: boolean;
          branded_reports_enabled?: boolean;
          monthly_ai_report_limit?: number;
          clerk_subscription_id?: string | null;
          clerk_plan_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          organization_id: string;
          team_id: string;
          type: SessionType;
          status: SessionStatus | null;
          title: string;
          description: string | null;
          opponent: string | null;
          location: string | null;
          scheduled_at: string | null;
          started_at: string | null;
          ended_at: string | null;
          planned_duration_min: number | null;
          actual_duration_min: number | null;
          focus_area: string | null;
          planned_intensity: number | null;
          coach_notes: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          team_id: string;
          type: SessionType;
          status?: SessionStatus | null;
          title: string;
          description?: string | null;
          opponent?: string | null;
          location?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          planned_duration_min?: number | null;
          actual_duration_min?: number | null;
          focus_area?: string | null;
          planned_intensity?: number | null;
          coach_notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          team_id?: string;
          type?: SessionType;
          status?: SessionStatus | null;
          title?: string;
          description?: string | null;
          opponent?: string | null;
          location?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          planned_duration_min?: number | null;
          actual_duration_min?: number | null;
          focus_area?: string | null;
          planned_intensity?: number | null;
          coach_notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      session_attendance: {
        Row: {
          id: string;
          session_id: string;
          athlete_id: string;
          attended: boolean | null;
          absence_reason: string | null;
          minutes_played: number | null;
          rpe: number | null;
          athlete_note: string | null;
          coach_note: string | null;
          pain_reported: boolean | null;
          pain_area: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          athlete_id: string;
          attended?: boolean | null;
          absence_reason?: string | null;
          minutes_played?: number | null;
          rpe?: number | null;
          athlete_note?: string | null;
          coach_note?: string | null;
          pain_reported?: boolean | null;
          pain_area?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          athlete_id?: string;
          attended?: boolean | null;
          absence_reason?: string | null;
          minutes_played?: number | null;
          rpe?: number | null;
          athlete_note?: string | null;
          coach_note?: string | null;
          pain_reported?: boolean | null;
          pain_area?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      training_blocks: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          description: string | null;
          order_index: number;
          planned_duration_min: number | null;
          actual_duration_min: number | null;
          intensity: number | null;
          drill_id: string | null;
          completed: boolean | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          planned_duration_min?: number | null;
          actual_duration_min?: number | null;
          intensity?: number | null;
          drill_id?: string | null;
          completed?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          planned_duration_min?: number | null;
          actual_duration_min?: number | null;
          intensity?: number | null;
          drill_id?: string | null;
          completed?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      wellness_checkins: {
        Row: {
          id: string;
          organization_id: string;
          team_id: string | null;
          athlete_id: string;
          checkin_date: string;
          sleep_quality: number | null;
          sleep_hours: number | null;
          fatigue: number | null;
          muscle_soreness: number | null;
          stress: number | null;
          mood: number | null;
          readiness_score: number | null;
          pain_area: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          team_id?: string | null;
          athlete_id: string;
          checkin_date?: string;
          sleep_quality?: number | null;
          sleep_hours?: number | null;
          fatigue?: number | null;
          muscle_soreness?: number | null;
          stress?: number | null;
          mood?: number | null;
          readiness_score?: number | null;
          pain_area?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          team_id?: string | null;
          athlete_id?: string;
          checkin_date?: string;
          sleep_quality?: number | null;
          sleep_hours?: number | null;
          fatigue?: number | null;
          muscle_soreness?: number | null;
          stress?: number | null;
          mood?: number | null;
          readiness_score?: number | null;
          pain_area?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      nutrition_logs: {
        Row: {
          id: string;
          organization_id: string;
          team_id: string | null;
          athlete_id: string;
          log_date: string;
          hydration_score: number | null;
          meal_quality: number | null;
          protein_servings: number | null;
          carbs_timing: string | null;
          supplements: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          team_id?: string | null;
          athlete_id: string;
          log_date?: string;
          hydration_score?: number | null;
          meal_quality?: number | null;
          protein_servings?: number | null;
          carbs_timing?: string | null;
          supplements?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          team_id?: string | null;
          athlete_id?: string;
          log_date?: string;
          hydration_score?: number | null;
          meal_quality?: number | null;
          protein_servings?: number | null;
          carbs_timing?: string | null;
          supplements?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      has_org_role: {
        Args: {
          org_id: string;
          allowed_roles: OrganizationRole[];
        };
        Returns: boolean;
      };
      is_athlete_self: {
        Args: {
          athlete_uuid: string;
        };
        Returns: boolean;
      };
      is_org_member: {
        Args: {
          org_id: string;
        };
        Returns: boolean;
      };
      is_team_staff: {
        Args: {
          team_uuid: string;
        };
        Returns: boolean;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      athlete_status: AthleteStatus;
      organization_role: OrganizationRole;
      organization_type: OrganizationType;
      sport_type: SportType;
      team_plan_tier: TeamPlanTier;
      session_type: SessionType;
      session_status: SessionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicTables = Database["public"]["Tables"];

export type Tables<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Row"];

export type TablesInsert<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Insert"];

export type TablesUpdate<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Update"];
