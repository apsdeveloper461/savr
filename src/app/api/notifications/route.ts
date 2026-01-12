import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { Notification } from "@/models/transactions"; // Notification is there?? Let me check where I put it. It was in transactions.ts in my thought process.
// Wait, I put Notification in transactions.ts in Step 29 call. "Mongoose models for Income, Expense, SavingGoal, Notification."
import { Notification as NotificationModel } from "@/models/transactions";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  const notifications = await NotificationModel.find({ userId: user.id }).sort({ createdAt: "desc" });

  return jsonResponse({
    notifications: notifications.map(n => ({ ...n.toObject(), id: n._id.toString() }))
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(payload?.ids) ? payload.ids : [];

  await dbConnect();

  if (ids.length === 0) {
    await NotificationModel.updateMany(
      { userId: user.id, isRead: false },
      { isRead: true }
    );
  } else {
    await NotificationModel.updateMany(
      { userId: user.id, _id: { $in: ids } },
      { isRead: true }
    );
  }

  return jsonResponse({ success: true });
}
