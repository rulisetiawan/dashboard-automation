import { createHash, randomBytes, timingSafeEqual, pbkdf2 as pbkdf2Callback } from "node:crypto";

const passwordIterations = 600_000;
const passwordKeyLength = 32;
const passwordDigest = "sha256";

function pbkdf2(password: string, salt: Buffer, iterations = passwordIterations) {
  return new Promise<Buffer>((resolve, reject) => {
    pbkdf2Callback(password, salt, iterations, passwordKeyLength, passwordDigest, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export function validateDashboardPassword(password: string) {
  if (password.length < 12) throw new Error("Password minimal 12 karakter.");
  if (password.length > 128) throw new Error("Password maksimal 128 karakter.");
}

export async function hashDashboardPassword(password: string) {
  validateDashboardPassword(password);
  const salt = randomBytes(32);
  const derivedKey = await pbkdf2(password, salt);
  return `pbkdf2-sha256$${passwordIterations}$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

export async function verifyDashboardPassword(password: string, encodedHash: string) {
  const [algorithm, rawIterations, rawSalt, rawKey] = String(encodedHash || "").split("$");
  if (algorithm !== "pbkdf2-sha256") return false;
  const iterations = Number(rawIterations);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000 || !rawSalt || !rawKey) return false;
  const expected = Buffer.from(rawKey, "base64");
  if (expected.length !== passwordKeyLength) return false;
  const actual = await pbkdf2(password, Buffer.from(rawSalt, "base64"), iterations);
  return timingSafeEqual(actual, expected);
}

export function createDashboardSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashDashboardSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

