import {
  createHmac,
  timingSafeEqual,
} from "crypto";

export const SESSION_COOKIE =
  "cmu_session";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "cmu-helpdesk-development-secret";

export type SessionUser = {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  email: string;
  department: string;
};

type SessionPayload =
  SessionUser & {
    exp: number;
  };

function encode(value: unknown) {
  return Buffer.from(
    JSON.stringify(value)
  ).toString("base64url");
}

function decode<T>(value: string): T {
  return JSON.parse(
    Buffer.from(
      value,
      "base64url"
    ).toString("utf8")
  ) as T;
}

function sign(value: string) {
  return createHmac(
    "sha256",
    SESSION_SECRET
  )
    .update(value)
    .digest("base64url");
}

export function createSessionToken(
  user: SessionUser
) {
  const payload: SessionPayload = {
    ...user,
    exp:
      Math.floor(
        Date.now() / 1000
      ) +
      60 * 60 * 8,
  };

  const encoded =
    encode(payload);

  const signature =
    sign(encoded);

  return `${encoded}.${signature}`;
}

export function verifySessionToken(
  token: string
): SessionUser | null {
  try {
    const parts =
      token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [
      encoded,
      providedSignature,
    ] = parts;

    const expectedSignature =
      sign(encoded);

    const providedBuffer =
      Buffer.from(
        providedSignature,
        "utf8"
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    if (
      providedBuffer.length !==
      expectedBuffer.length
    ) {
      return null;
    }

    if (
      !timingSafeEqual(
        providedBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    const payload =
      decode<SessionPayload>(
        encoded
      );

    if (
      !payload.exp ||
      payload.exp <
        Math.floor(
          Date.now() / 1000
        )
    ) {
      return null;
    }

    return {
      userId: String(
        payload.userId
      ),
      username:
        payload.username,
      fullName:
        payload.fullName,
      role:
        payload.role,
      email:
        payload.email,
      department:
        payload.department,
    };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(
  request: Request
) {
  const cookieHeader =
    request.headers.get(
      "cookie"
    ) || "";

  const cookies =
    cookieHeader
      .split(";")
      .map((item) =>
        item.trim()
      );

  const sessionCookie =
    cookies.find((item) =>
      item.startsWith(
        `${SESSION_COOKIE}=`
      )
    );

  if (!sessionCookie) {
    return null;
  }

  const token =
    sessionCookie.slice(
      SESSION_COOKIE.length + 1
    );

  return verifySessionToken(
    token
  );
}