import type { CategoryCounts, ExpoPushMessage, NotificationCategory } from "./types.ts";

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

function categoryCopy(category: NotificationCategory): {
  mixed: string;
  expired: string;
  expiring: string;
  bodyNoun: [string, string];
} {
  if (category === "staff") {
    return {
      mixed: "Staff Documents Need Attention",
      expired: "Staff Documents Expired",
      expiring: "Staff Documents Expiring",
      bodyNoun: ["document", "documents"],
    };
  }
  if (category === "vehicle") {
    return {
      mixed: "Vehicle Daftar Need Attention",
      expired: "Vehicle Daftar Expired",
      expiring: "Vehicle Daftar Expiring",
      bodyNoun: ["vehicle Daftar", "vehicle Daftar"],
    };
  }
  return {
    mixed: "Branch Licenses Need Attention",
    expired: "Branch Licenses Expired",
    expiring: "Branch Licenses Expiring",
    bodyNoun: ["license", "licenses"],
  };
}

export function buildPushMessage(
  category: NotificationCategory,
  counts: CategoryCounts,
): ExpoPushMessage | null {
  if (counts.total <= 0) return null;
  if (category === "test") return null;

  const copy = categoryCopy(category);

  let title: string;
  if (counts.expired > 0 && counts.expiring > 0) title = copy.mixed;
  else if (counts.expired > 0) title = copy.expired;
  else title = copy.expiring;

  const body = `${counts.total} ${plural(counts.total, copy.bodyNoun[0], copy.bodyNoun[1])} need attention.`;

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
