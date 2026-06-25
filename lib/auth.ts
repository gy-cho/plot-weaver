import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "pw_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30일

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      ".env에 SESSION_SECRET이 설정되어 있지 않습니다. 임의의 긴 문자열을 추가해주세요."
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "SESSION_SECRET이 너무 짧습니다 (32자 이상 권장). 추측하기 어려운 긴 문자열로 바꿔주세요."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS };
