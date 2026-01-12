"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Target } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddGoalDialog } from "./add-goal-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";

type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    type: string;
};

export function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const refreshGoals = async () => {
        const res = await fetch("/api/saving-goals");
        if (res.ok) {
            const data = await res.json();
            setGoals(data.goals);
        }
    };

    const deleteGoal = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/saving-goals/${id}`, { method: "DELETE" });
            if (res.ok) refreshGoals();
        } catch (e) { console.error(e); }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Saving Goals</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Track your progress towards financial milestones.
                    </p>
                </div>
                <AddGoalDialog onGoalAdded={refreshGoals} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => {
                    const progress = goal.targetAmount > 0
                        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                        : 0;

                    return (
                        <Card key={goal.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-medium">
                                        {goal.name}
                                    </CardTitle>
                                    <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {goal.type}
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
                                            Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => deleteGoal(goal.id)} className="text-red-600">
                                            Delete Goal
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                                        <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-bold">{formatCurrency(goal.currentAmount)}</p>
                                        <p className="text-xs text-zinc-500">of {formatCurrency(goal.targetAmount)} goal</p>
                                    </div>
                                    {goal.deadline && (
                                        <div className="text-right">
                                            <p className="text-xs text-zinc-500">Deadline</p>
                                            <p className="text-sm font-medium">{new Date(goal.deadline).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <EditGoalDialog
                goal={editingGoal}
                isOpen={!!editingGoal}
                onClose={() => setEditingGoal(null)}
                onUpdate={refreshGoals}
            />
        </div>
    );
}
