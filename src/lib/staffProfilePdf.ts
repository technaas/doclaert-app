import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatPay } from '@/src/lib/format';
import { formatKuwaitContact, formatNativeContactFromStaff, formatStaffEmail } from '@/src/lib/staffContact';
import { formatSalaryType, formatStaffType } from '@/src/lib/staffDisplay';
import { isPartTimeType } from '@/src/lib/staffFilters';
import { displayPassportCustody } from '@/src/lib/staffPassport';
import { displayVisaWorkingType, isDifferentCompanyVisa } from '@/src/lib/staffVisa';
import type { StaffMember } from '@/src/types/staff';

export type StaffProfilePdfInput = {
  staff: StaffMember;
  brandName: string;
  branchName: string;
  partTimeBrandName: string | null;
  partTimeBranchName: string | null;
  includeSalary: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cell(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return escapeHtml(trimmed || '—');
}

function row(label: string, value: string | null | undefined): string {
  return `<tr><th>${escapeHtml(label)}</th><td>${cell(value)}</td></tr>`;
}

function isShareCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('cancel') || message.includes('dismiss');
}

function buildStaffProfileHtml(input: StaffProfilePdfInput): string {
  const { staff, includeSalary } = input;
  const photoUrl = staff.photo_url?.trim();
  const photoHtml =
    photoUrl && /^https?:\/\//i.test(photoUrl)
      ? `<img class="photo" src="${escapeHtml(photoUrl)}" alt="" />`
      : `<div class="photo-fallback">${escapeHtml((staff.name || 'S').slice(0, 1).toUpperCase())}</div>`;

  const visaLabel = displayVisaWorkingType(staff.visa_working_type, staff.staff_type);
  const showPartTime =
    isDifferentCompanyVisa(staff.visa_working_type, staff.staff_type) ||
    isPartTimeType(staff.staff_type);
  const kuwaitContact =
    formatKuwaitContact(staff.kuwait_contact_number) || staff.contact_number?.trim() || '—';
  const nativeContact = formatNativeContactFromStaff(staff) || '—';

  const salaryRows = includeSalary
    ? `${row('Salary', typeof staff.salary === 'number' ? formatPay(staff.salary) : '—')}
       ${row('Salary type', formatSalaryType(staff.salary_type))}`
    : '';

  const visaCompanyRow = isDifferentCompanyVisa(staff.visa_working_type, staff.staff_type)
    ? row('Visa company name', staff.visa_company_name)
    : '';

  const partTimeSection = showPartTime
    ? `
      <h2>Part-time details</h2>
      <table>
        ${row('Part-time brand', input.partTimeBrandName)}
        ${row('Part-time branch', input.partTimeBranchName)}
        ${row('License expiry', staff.part_time_license_expiry_date)}
        ${row('Note', staff.part_time_note)}
      </table>`
    : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { margin: 28px; }
      body { font-family: Helvetica, Arial, sans-serif; color: #0F172A; font-size: 12px; }
      h1 { font-size: 20px; margin: 0 0 4px; color: #0B2A5B; }
      .meta { color: #64748B; margin-bottom: 16px; }
      .header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 18px; }
      .photo, .photo-fallback {
        width: 72px; height: 72px; border-radius: 12px; object-fit: cover;
        background: #EEF4FF; color: #0B2A5B; display: flex; align-items: center;
        justify-content: center; font-size: 24px; font-weight: 700;
      }
      h2 { font-size: 13px; color: #0B2A5B; border-bottom: 2px solid #FF4B3E; padding-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
      th, td { text-align: left; padding: 6px 0; vertical-align: top; }
      th { width: 38%; color: #64748B; font-weight: 600; }
      td { color: #0F172A; }
      .brand { font-size: 11px; color: #64748B; letter-spacing: 0.4px; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div class="brand">DocAlert · Staff profile</div>
    <div class="header">
      ${photoHtml}
      <div>
        <h1>${cell(staff.name)}</h1>
        <div class="meta">${cell(staff.role)} · Staff ID ${cell(staff.staff_id)}</div>
        <div class="meta">${cell(input.brandName)} · ${cell(input.branchName)}</div>
      </div>
    </div>
    <h2>Personal &amp; contact</h2>
    <table>
      ${row('Staff name', staff.name)}
      ${row('Role', staff.role)}
      ${row('Staff ID', staff.staff_id)}
      ${row('Email', formatStaffEmail(staff.email) || '—')}
      ${row('Kuwait contact number', kuwaitContact)}
      ${row('Native / India contact number', nativeContact)}
      ${row('Civil ID number', staff.civil_id_number)}
    </table>
    <h2>Identity documents</h2>
    <table>
      ${row('Passport custody', displayPassportCustody(staff.passport_custody))}
      ${row('Passport code number', staff.passport_code_number)}
    </table>
    <h2>Employment</h2>
    <table>
      ${row('Brand', input.brandName)}
      ${row('Branch', input.branchName)}
      ${row('Staff type', formatStaffType(staff.staff_type))}
      ${row('Visa / working type', visaLabel)}
      ${visaCompanyRow}
      ${salaryRows}
      ${row('Status', staff.status)}
    </table>
    ${partTimeSection}
  </body>
</html>`;
}

export async function shareStaffProfilePdf(
  input: StaffProfilePdfInput,
): Promise<{ action: 'shared' | 'unavailable' | 'failed'; message?: string }> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return {
        action: 'unavailable',
        message: 'Saving files is not available on this device.',
      };
    }

    const html = buildStaffProfileHtml(input);
    const result = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Save staff PDF',
      UTI: 'com.adobe.pdf',
    });
    return { action: 'shared' };
  } catch (error) {
    if (isShareCancelled(error)) {
      return { action: 'shared' };
    }
    return {
      action: 'failed',
      message: 'Unable to create the staff PDF right now.',
    };
  }
}
