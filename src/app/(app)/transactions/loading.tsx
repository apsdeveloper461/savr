import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TransactionsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-7 w-24 mb-1" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div>
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
