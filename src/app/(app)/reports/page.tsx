import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Deep dive into your financial habits.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900 mb-6">
                        <BarChart3 className="h-10 w-10 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Detailed Analytics</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
                        We are building comprehensive reports to help you understand your spending patterns, savings growth, and net worth evolution.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
