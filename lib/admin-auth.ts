import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jk_admin_session";

function getSecret() {
  return process.env.ADMIN_PASSWORD || "jkphoto2026";
}

export function createSessionToken() {
  return createHmac("sha256", getSecret()).update("jk-admin-ok").digest("hex");
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const expected = Buffer.from(createSessionToken(), "utf8");
    const actual = Buffer.from(token, "utf8");
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

export function verifyPassword(password: string) {
  const expected = getSecret();
  try {
    const a = Buffer.from(password, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return password === expected;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}
