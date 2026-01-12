import { endOfMonth, startOfMonth } from "date-fns";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { getCategoryBreakdown, getDashboardMetrics, getIncomeVsExpenseTrend } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const now = new Date();
  const [metrics, categories, trend] = await Promise.all([
    getDashboardMetrics(user.id),
    getCategoryBreakdown(user.id, startOfMonth(now), endOfMonth(now)),
    getIncomeVsExpenseTrend(user.id, 6),
  ]);

  return jsonResponse({ metrics, categories, trend });
}
