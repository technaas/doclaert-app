import type { CategoryCounts, ExpoPushMessage, NotificationCategory } from "./types.ts";

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

export function buildPushMessage(
  category: NotificationCategory,
  counts: CategoryCounts,
): ExpoPushMessage | null {
  if (counts.total <= 0) return null;

  const isStaff = category === "staff";

  let title: string;
  if (counts.expired > 0 && counts.expiring > 0) {
    title = isStaff
      ? "Staff Documents Need Attention"
      : "Branch Licenses Need Attention";
  } else if (counts.expired > 0) {
    title = isStaff ? "Staff Documents Expired" : "Branch Licenses Expired";
  } else {
    title = isStaff
      ? "Staff Documents Expiring"
      : "Branch Licenses Expiring";
  }

  const body = isStaff
    ? `${counts.total} staff ${plural(counts.total, "document", "documents")} need attention.`
    : `${counts.total} branch ${plural(counts.total, "license", "licenses")} need attention.`;

  let status: "expired" | "expiring" | "mixed";
  if (counts.expired > 0 && counts.expiring > 0) status = "mixed";
  else if (counts.expired > 0) status = "expired";
  else status = "expiring";

  return {
    to: "",
    title,
    body,
    data: {
      screen: "alerts",
      type: category,
      status,
    },
  };
}
