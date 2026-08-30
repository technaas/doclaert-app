import {
  canViewAlerts,
  canViewBrand,
  canViewBranch,
  canViewDashboard,
  canViewDocuments,
  canViewSalary,
  canViewStaff,
  canViewVehicles,
} from '@/src/lib/permissions';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import type { MainTabParamList } from '@/src/navigation/MainTabNavigator';

export type GatedAppRoute = keyof MainTabParamList | keyof AppStackParamList;

export function canAccessAppRoute(
  role: string | null | undefined,
  route: GatedAppRoute,
): boolean {
  switch (route) {
    case 'Dashboard':
      return canViewDashboard(role);
    case 'Staff':
      return canViewStaff(role);
    case 'Salary':
      return canViewSalary(role);
    case 'Documents':
      return canViewDocuments(role);
    case 'Vehicles':
      return canViewVehicles(role);
    case 'Settings':
      return true;
    case 'Alerts':
      return canViewAlerts(role);
    case 'AccessDenied':
      return true;
    case 'Brands':
    case 'BrandDetail':
      return canViewBrand(role);
    case 'Branches':
    case 'BranchDetail':
      return canViewBranch(role);
    case 'DocumentDetail':
      return canViewDocuments(role);
    case 'VehicleDetail':
      return canViewVehicles(role);
    case 'MainTabs':
      return true;
    default:
      return true;
  }
}

export function visibleMainTabs(role: string | null | undefined): (keyof MainTabParamList)[] {
  const tabs: (keyof MainTabParamList)[] = [];
  if (canViewDashboard(role)) tabs.push('Dashboard');
  if (canViewStaff(role)) tabs.push('Staff');
  if (canViewSalary(role)) tabs.push('Salary');
  if (canViewDocuments(role)) tabs.push('Documents');
  if (canViewBranch(role)) tabs.push('Branches');
  tabs.push('Settings');
  return tabs;
}
