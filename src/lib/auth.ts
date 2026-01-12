import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { AppJwtPayload, verifyJwt } from "./jwt";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "savr_session";

const readSessionToken = async () => {
  const cookieStore = await Promise.resolve(cookies());
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
};

export const getSessionToken = async () => {
  try {
    return await readSessionToken();
  } catch (_error) {
    return null;
  }
};

export const getTokenFromRequest = (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ?? null;
};

export const getCurrentUser = async () => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        accounts: true,
        categories: true,
        incomeSources: true,
        savingGoals: true,
      },
    });
    return user;
  } catch (_error) {
    return null;
  }
};

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};

export const decodeSession = async (): Promise<AppJwtPayload | null> => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }
  try {
    return await verifyJwt(token);
  } catch (_error) {
    return null;
  }
};

export const getUserFromRequest = async (request: NextRequest) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJwt(token);
    return prisma.user.findUnique({ where: { id: payload.sub } });
  } catch (_error) {
    return null;
  }
};
