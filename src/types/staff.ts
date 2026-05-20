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
  status: string | null;
  salary: number | null;
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
  status: string | null;
};

export type StaffListItem = StaffMember & {
  brandName: string;
  branchName: string;
  partTimeBrandName: string | null;
  partTimeBranchName: string | null;
};
