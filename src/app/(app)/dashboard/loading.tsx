import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-[40px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[140px]" />
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <Skeleton className="h-5 w-[140px] mb-2" />
                        <Skeleton className="h-4 w-[100px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-5 w-[140px] mb-2" />
                        <Skeleton className="h-4 w-[100px]" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center py-4">
                            <Skeleton className="h-[200px] w-[200px] rounded-full" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="h-4 w-[50px]" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <Skeleton className="h-5 w-[140px] mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border p-4 space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[60px]" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                        <CardContent className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
