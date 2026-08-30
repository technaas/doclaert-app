export type AccessScope = {
  ready: boolean;
  cacheKey: string;
  allBrands: boolean;
  allBranches: boolean;
  brandIds: Set<string>;
  branchIds: Set<string>;
  canBrand: (brandId: string | null | undefined) => boolean;
  canBranch: (
    branchId: string | null | undefined,
    brandId?: string | null,
  ) => boolean;
  filterBrands: <T extends { id: string }>(rows: T[]) => T[];
  filterBranches: <T extends { id: string; brand_id: string }>(rows: T[]) => T[];
  filterByBrandId: <T extends { brand_id?: string | null }>(rows: T[]) => T[];
  filterByBranch: <
    T extends { branch_id?: string | null; brand_id?: string | null },
  >(
    rows: T[],
  ) => T[];
};

export function emptyAccessScope(ready = false): AccessScope {
  const none = new Set<string>();
  return makeAccessScope({
    ready,
    allBrands: false,
    allBranches: false,
    brandIds: none,
    branchIds: none,
  });
}

export function companyWideAccessScope(): AccessScope {
  return makeAccessScope({
    ready: true,
    allBrands: true,
    allBranches: true,
    brandIds: new Set(),
    branchIds: new Set(),
  });
}

export function makeAccessScope(input: {
  ready: boolean;
  allBrands: boolean;
  allBranches: boolean;
  brandIds: Set<string>;
  branchIds: Set<string>;
}): AccessScope {
  const { ready, allBrands, allBranches, brandIds, branchIds } = input;
  const cacheKey = [
    ready ? '1' : '0',
    allBrands ? '1' : '0',
    allBranches ? '1' : '0',
    [...brandIds].sort().join(','),
    [...branchIds].sort().join(','),
  ].join('|');

  const canBrand = (brandId: string | null | undefined) => {
    if (!brandId) return false;
    if (allBrands) return true;
    return brandIds.has(brandId);
  };

  const canBranch = (
    branchId: string | null | undefined,
    brandId?: string | null,
  ) => {
    if (!branchId) return false;
    if (allBrands && allBranches) return true;
    if (allBranches) {
      if (brandId) return canBrand(brandId);
      return false;
    }
    return branchIds.has(branchId);
  };

  return {
    ready,
    cacheKey,
    allBrands,
    allBranches,
    brandIds,
    branchIds,
    canBrand,
    canBranch,
    filterBrands: (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      return allBrands ? list : list.filter((r) => canBrand(r.id));
    },
    filterBranches: (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      return list.filter((r) => canBranch(r.id, r.brand_id));
    },
    filterByBrandId: (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      return allBrands ? list : list.filter((r) => canBrand(r.brand_id));
    },
    filterByBranch: (rows) => {
      const list = Array.isArray(rows) ? rows : [];
      return list.filter((r) => canBranch(r.branch_id ?? null, r.brand_id ?? null));
    },
  };
}
