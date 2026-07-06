export interface ApiOrganization {
  _id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export type ApiOrgRole = 'owner' | 'admin' | 'staff' | 'athlete';

export interface ApiOrgMember {
  _id: string;
  organization_id: string;
  user_id: string;
  role: ApiOrgRole;
  created_at: string;
  updated_at: string;
}

export interface ApiTeam {
  _id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiAthlete {
  _id: string;
  team_id: string;
  user_id?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  status: 'active' | 'injured' | 'inactive';
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiSession {
  _id: string;
  team_id: string;
  title: string;
  date: string;
  duration_minutes: number;
  type: string;
  created_at: string;
  updated_at: string;
  attendanceCount?: number;
  trainingBlocksCount?: number;
  trainingBlocks?: any[];
}

export interface ApiAttendance {
  _id: string;
  session_id: string;
  athlete_id: string;
  status: 'present' | 'absent' | 'excused' | 'injured';
  created_at: string;
}

export interface ApiWellnessCheckin {
  _id: string;
  athlete_id: string;
  date: string;
  readiness_score: number;
  fatigue_level: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness_level: number;
  stress_level: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiNutritionLog {
  _id: string;
  athlete_id: string;
  date: string;
  meal_quality: number;
  hydration_ounces: number;
  supplements_taken: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiPersonalTraining {
  _id: string;
  athlete_id: string;
  date: string;
  duration_minutes: number;
  type: string;
  intensity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
