import { getCurrentUser } from "@/lib/auth";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Notification } from "@/models/transactions";

export default async function NotificationsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    await dbConnect();
    const notifications = await Notification.find({ userId: user.id }).sort({ createdAt: "desc" }).lean();

    const formattedNotifications = notifications.map(n => ({
        ...n,
        id: n._id.toString(),
        _id: undefined,
        userId: undefined,
        __v: undefined,
        createdAt: n.createdAt.toISOString()
    }));

    return <NotificationsClient initialNotifications={formattedNotifications as any} />;
}
