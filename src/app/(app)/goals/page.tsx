import { getCurrentUser } from "@/lib/auth";
import { GoalsClient } from "@/components/goals/goals-client";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { SavingGoal } from "@/models/transactions";

export default async function GoalsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    await dbConnect();
    const goals = await SavingGoal.find({ userId: user.id }).sort({ createdAt: "desc" }).lean();

    const formattedGoals = goals.map(g => ({
        ...g,
        id: g._id.toString(),
        _id: undefined,
        userId: undefined,
        __v: undefined,
        deadline: g.deadline ? g.deadline.toISOString() : undefined
    }));

    return <GoalsClient initialGoals={formattedGoals as any} />;
}
