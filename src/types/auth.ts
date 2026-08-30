export type UserRole = string;

export type Profile = {
  id: string;
  company_id: string | null;
  role: UserRole | null;
  name?: string | null;
  email?: string | null;
  is_active?: boolean | null;
  must_change_password?: boolean | null;
  access_all_brands?: boolean | null;
  access_all_branches?: boolean | null;
  assigned_branch_id?: string | null;
};

export const ACCOUNT_DISABLED_MESSAGE =
  'This account has been disabled. Please contact your administrator.';

export const PROFILE_MISSING_MESSAGE =
  'No profile found for this user. Please contact your Technaas administrator.';
