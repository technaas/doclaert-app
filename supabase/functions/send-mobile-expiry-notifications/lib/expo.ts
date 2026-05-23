import type { ExpoPushMessage } from "./types.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface ExpoTicketResult {
  ok: boolean;
  ticketId?: string;
  error?: string;
}

export interface ExpoPushRawResult {
  httpOk: boolean;
  httpStatus: number;
  body: unknown;
  httpError?: string;
  tickets: ExpoTicketResult[];
}

function parseExpoTickets(payload: unknown): ExpoTicketResult[] {
  const tickets: unknown[] = Array.isArray((payload as Record<string, unknown>)?.data)
    ? (payload as Record<string, unknown>).data as unknown[]
    : [(payload as Record<string, unknown>)?.data ?? payload];

  return tickets.map((ticket) => {
    const t = ticket as Record<string, unknown>;
    if (t?.status === "ok") {
      return { ok: true, ticketId: String(t.id ?? "") };
    }
    const details = t?.details as Record<string, unknown> | undefined;
    const message = String(
      t?.message ?? details?.error ?? "Expo push ticket error",
    );
    return { ok: false, error: message };
  });
}

export async function sendExpoPushRaw(
  messages: ExpoPushMessage[],
): Promise<ExpoPushRawResult> {
  if (!messages.length) {
    return { httpOk: true, httpStatus: 200, body: { data: [] }, tickets: [] };
  }

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  const text = await res.text().catch(() => "");
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!res.ok) {
    return {
      httpOk: false,
      httpStatus: res.status,
      body,
      httpError: `Expo Push API ${res.status}: ${text.slice(0, 300)}`,
      tickets: [],
    };
  }

  const tickets = parseExpoTickets(body);
  return {
    httpOk: true,
    httpStatus: res.status,
    body,
    tickets,
  };
}

export async function sendExpoPush(
  messages: ExpoPushMessage[],
): Promise<ExpoTicketResult[]> {
  const raw = await sendExpoPushRaw(messages);
  if (!raw.httpOk) {
    throw new Error(raw.httpError ?? `Expo Push API ${raw.httpStatus}`);
  }
  return raw.tickets;
}
