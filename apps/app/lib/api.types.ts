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
