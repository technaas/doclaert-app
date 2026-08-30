export type Brand = {
  id: string;
  name: string;
};

export type Branch = {
  id: string;
  name: string;
  brand_id: string;
};

export type StaffMember = {
  id: string;
  company_id: string;
  brand_id: string;
  branch_id: string;
  name: string;
  role: string | null;
  staff_id: string | null;
  contact_number: string | null;
  email: string | null;
  photo_url: string | null;
  kuwait_contact_number: string | null;
  india_contact_number: string | null;
  native_contact_country_code: string | null;
  native_contact_number: string | null;
  civil_id_number: string | null;
  passport_custody: string | null;
  passport_code_number: string | null;
  visa_working_type: string | null;
  visa_company_name: string | null;
  status: string | null;
  salary: number | null;
  salary_type: string | null;
  staff_type: string | null;
  part_time_license_expiry_date: string | null;
  part_time_note: string | null;
  part_time_brand_id: string | null;
  part_time_branch_id: string | null;
  part_time_license_file_url: string | null;
};

export type StaffDocument = {
  id: string;
  document_name: string;
  expiry_date: string | null;
  expiry_status: string | null;
  status: string | null;
  file_url: string | null;
};

export type StaffListItem = StaffMember & {
  brandName: string;
  branchName: string;
  partTimeBrandName: string | null;
  partTimeBranchName: string | null;
};
