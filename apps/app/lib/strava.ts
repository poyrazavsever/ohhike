import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
  };
};

export type StravaActivity = {
  id: number;
  name: string;
  sport_type?: string;
  type?: string;
  start_date?: string;
  elapsed_time?: number;
  distance?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain?: number;
};

function encryptionKey() {
  const source = process.env.CLERK_ENCRYPTION_KEY?.trim();

  if (!source) {
    throw new Error("Missing CLERK_ENCRYPTION_KEY.");
  }

  return createHash("sha256").update(source).digest();
}

export function encryptStravaSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptStravaSecret(value: string) {
  const [iv, tag, encrypted] = value.split(".");

  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted Strava secret.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function signStravaState(payload: object) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", encryptionKey())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

export function verifyStravaState<T>(value: string): T | null {
  const [encoded, signature] = value.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expected = createHmac("sha256", encryptionKey())
    .update(encoded)
    .digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function getStravaConfig() {
  const clientId = process.env.STRAVA_CLIENT_ID?.trim();
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET.");
  }

  return { clientId, clientSecret };
}

export function buildStravaAuthorizeUrl(input: {
  redirectUri: string;
  state: string;
}) {
  const { clientId } = getStravaConfig();
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", "read,activity:read");
  url.searchParams.set("state", input.state);
  return url.toString();
}

async function requestToken(body: URLSearchParams): Promise<StravaTokenResponse> {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Strava token request failed (${response.status}).`);
  }

  return (await response.json()) as StravaTokenResponse;
}

export async function exchangeStravaCode(code: string) {
  const { clientId, clientSecret } = getStravaConfig();
  return requestToken(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  );
}

export async function refreshStravaToken(refreshToken: string) {
  const { clientId, clientSecret } = getStravaConfig();
  return requestToken(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  );
}

export async function listStravaActivities(accessToken: string) {
  const url = new URL("https://www.strava.com/api/v3/athlete/activities");
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "30");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Strava activity sync failed (${response.status}).`);
  }

  return (await response.json()) as StravaActivity[];
}
