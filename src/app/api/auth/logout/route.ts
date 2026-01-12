import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";

export async function POST() {
  const response = jsonResponse({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
