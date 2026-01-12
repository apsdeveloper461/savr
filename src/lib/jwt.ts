import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return encoder.encode(secret);
};

export type AppJwtPayload = {
  sub: string;
  email: string;
  name?: string | null;
  image?: string | null;
  iat?: number;
  exp?: number;
};

export const signJwt = async (payload: AppJwtPayload, expiresIn = "7d") => {
  const secret = getSecretKey();
  const issuedAt = Math.floor(Date.now() / 1000);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresIn)
    .sign(secret);
};

export const verifyJwt = async (token: string) => {
  const secret = getSecretKey();
  const { payload } = await jwtVerify<AppJwtPayload>(token, secret, {
    algorithms: ["HS256"],
  });
  return payload;
};
