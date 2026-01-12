"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Bell, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Notification = {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
        if (unreadIds.length === 0) return;

        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: unreadIds }),
            });

            if (res.ok) {
                setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "LOW_BALANCE":
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case "GOAL_REACHED":
                return <TrendingUp className="h-5 w-5 text-emerald-500" />;
            case "MONTHLY_SUMMARY":
                return <Bell className="h-5 w-5 text-blue-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-zinc-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Stay updated with alerts and insights.
                    </p>
                </div>
                {notifications.some((n) => !n.isRead) && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                        <Check className="h-4 w-4" /> Mark all as read
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
                            <Bell className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">All caught up</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            No new notifications to show.
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <Card key={notification.id} className={cn("transition-colors", !notification.isRead && "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800")}>
                            <CardContent className="flex items-start gap-4 p-4">
                                <div className="mt-1 rounded-full bg-white p-2 shadow-sm dark:bg-zinc-950">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={cn("text-sm", !notification.isRead ? "font-semibold text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300")}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
