import { isAuthorizedCron } from "./auth.ts";
import { redactSecrets } from "./redact.ts";

const MOBILE_SECRET = "correct-mobile-secret";
const EMAIL_SECRET = "email-secret-must-not-authorize-mobile";

function requestWith(header?: string): Request {
  const headers = new Headers();
  if (header !== undefined) headers.set("x-cron-secret", header);
  return new Request("https://example.test/", { method: "POST", headers });
}

Deno.test("missing MOBILE_CRON_SECRET fails closed", () => {
  Deno.env.delete("MOBILE_CRON_SECRET");
  Deno.env.set("CRON_SECRET", EMAIL_SECRET);
  if (isAuthorizedCron(requestWith(EMAIL_SECRET))) {
    throw new Error("CRON_SECRET authorized a mobile run");
  }
});

Deno.test("empty or blank MOBILE_CRON_SECRET fails closed", () => {
  Deno.env.set("MOBILE_CRON_SECRET", "");
  if (isAuthorizedCron(requestWith(MOBILE_SECRET))) {
    throw new Error("empty secret was accepted");
  }
  Deno.env.set("MOBILE_CRON_SECRET", "   ");
  if (isAuthorizedCron(requestWith(MOBILE_SECRET))) {
    throw new Error("blank secret was accepted");
  }
});

Deno.test("missing or incorrect x-cron-secret fails closed", () => {
  Deno.env.set("MOBILE_CRON_SECRET", MOBILE_SECRET);
  Deno.env.set("CRON_SECRET", EMAIL_SECRET);
  if (isAuthorizedCron(requestWith())) {
    throw new Error("missing header was accepted");
  }
  if (isAuthorizedCron(requestWith("wrong-mobile-secret"))) {
    throw new Error("incorrect header was accepted");
  }
  if (isAuthorizedCron(requestWith(EMAIL_SECRET))) {
    throw new Error("email cron secret was accepted");
  }
});

Deno.test("matching MOBILE_CRON_SECRET is accepted", () => {
  Deno.env.set("MOBILE_CRON_SECRET", MOBILE_SECRET);
  if (!isAuthorizedCron(requestWith(MOBILE_SECRET))) {
    throw new Error("matching mobile secret was rejected");
  }
});

Deno.test("push tokens and bearer-like values are redacted", () => {
  const input = [
    "ExponentPushToken[abc123xyz]",
    "ExpoPushToken[def456uvw]",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
  ].join(" ");
  const output = redactSecrets(input);
  if (
    output.includes("abc123xyz") ||
    output.includes("def456uvw") ||
    output.includes("eyJhbGci")
  ) {
    throw new Error("secret material remained in the redacted text");
  }
});
