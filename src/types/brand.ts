export type BrandRecord = {
  id: string;
  company_id: string;
  name: string;
  contact_number: string | null;
  status: string | null;
};

export type BrandListItem = BrandRecord & {
  branchCount: number;
  staffCount: number;
  expiringDocsCount: number;
  expiredDocsCount: number;
};

export type BrandDetailData = BrandRecord & {
  branchCount: number;
  staffCount: number;
  expiringDocsCount: number;
  expiredDocsCount: number;
  branches: Array<{ id: string; name: string; location: string | null; status: string | null }>;
};
