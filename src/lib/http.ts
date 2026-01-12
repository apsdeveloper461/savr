import { NextResponse } from "next/server";

export const jsonResponse = <T>(data: T, init?: number | ResponseInit) => {
  if (typeof init === "number") {
    return NextResponse.json(data, { status: init });
  }
  return NextResponse.json(data, init);
};

export const errorResponse = (message: string, status = 400) => {
  return NextResponse.json({ error: message }, { status });
};
