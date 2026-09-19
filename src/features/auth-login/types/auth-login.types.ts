export interface LoginFormData {
  nip: string;
  password: string;
}

export interface LoginFormErrors {
  nip?: string;
  password?: string;
  general?: string;
}

export interface LoginUser {
  id: number;
  name: string;
  email: string | null;
  nip: string;
  avatar: string | null;
  email_verified_at: string | null;
  status: string;
  roles: LoginRole[];
  units: LoginUnit[];
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface LoginRole {
  id: number;
  name: string;
  guard_name: string;
  permissions: LoginPermission[];
  created_at: string;
}

export interface LoginPermission {
  id: number;
  name: string;
}

export interface LoginUnit {
  id: number;
  unit_name: string;
  slug: string;
  description: string;
  users_count: number;
  users: string[];
  created_at: string;
}

export interface LoginResponse {
  message: string;
  token_type: string;
  token: string;
  user: LoginUser;
}
