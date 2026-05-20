import type { StaffMember } from '@/src/types/staff';

export type SalarySummary = {
  totalStaff: number;
  activeStaff: number;
  totalPay: number;
  averageSalary: number;
};

export function calculateSalarySummary(staff: StaffMember[]): SalarySummary {
  const totalStaff = staff.length;
  const active = staff.filter((s) => (s.status ?? '') === 'active');
  const activeStaff = active.length;
  const totalPay = active.reduce(
    (sum, s) => sum + (typeof s.salary === 'number' ? s.salary : 0),
    0,
  );
  const averageSalary = activeStaff > 0 ? totalPay / activeStaff : 0;

  return {
    totalStaff,
    activeStaff,
    totalPay,
    averageSalary,
  };
}
