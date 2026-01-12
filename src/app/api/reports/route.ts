import { endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths, subYears } from "date-fns";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { getCategoryBreakdown, getReportSummary } from "@/lib/analytics";
import { reportQuerySchema } from "@/lib/validators";

const resolveRange = (
  range: string,
  customStart?: Date | null,
  customEnd?: Date | null,
): [Date, Date] => {
  const now = new Date();
  switch (range) {
    case "thisMonth":
      return [startOfMonth(now), endOfMonth(now)];
    case "lastMonth": {
      const start = startOfMonth(subMonths(now, 1));
      const end = endOfMonth(subMonths(now, 1));
      return [start, end];
    }
    case "thisYear":
      return [startOfYear(now), endOfYear(now)];
    case "lastYear": {
      const start = startOfYear(subYears(now, 1));
      const end = endOfYear(subYears(now, 1));
      return [start, end];
    }
    case "30d": {
      const start = subMonths(now, 1);
      return [start, now];
    }
    case "custom": {
      if (!customStart || !customEnd) {
        throw new Error("Custom range requires start and end");
      }
      return [customStart, customEnd];
    }
    default:
      return [startOfMonth(now), endOfMonth(now)];
  }
};

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = reportQuerySchema.safeParse({
    range: searchParams.get("range") ?? undefined,
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
  });

  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid filters", 422);
  }

  const { range, start, end } = parsed.data;

  let resolved: [Date, Date];
  try {
    resolved = resolveRange(range, start ?? null, end ?? null);
  } catch (error) {
    return errorResponse((error as Error).message, 400);
  }

  const [summary, categories] = await Promise.all([
    getReportSummary(user.id, resolved[0], resolved[1]),
    getCategoryBreakdown(user.id, resolved[0], resolved[1]),
  ]);

  return jsonResponse({ summary, categories, range: { start: resolved[0], end: resolved[1] } });
}
