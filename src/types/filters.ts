export type StaffFilters = {
  brandId: string;
  branchId: string;
  staffType: string;
  status: string;
  role: string;
  search: string;
};

export const DEFAULT_STAFF_FILTERS: StaffFilters = {
  brandId: 'all',
  branchId: 'all',
  staffType: 'all',
  status: 'all',
  role: 'all',
  search: '',
};
