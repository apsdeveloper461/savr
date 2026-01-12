"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savingGoalSchema } from "@/lib/validators";

const formSchema = savingGoalSchema.partial();
type FormValues = z.infer<typeof formSchema>;

type Goal = {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
};

export function EditGoalDialog({ goal, isOpen, onClose, onUpdate }: { goal: Goal | null, isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        values: {
            name: goal?.name,
            currentAmount: goal?.currentAmount,
            targetAmount: goal?.targetAmount,
        },
    });

    const onSubmit = async (data: FormValues) => {
        if (!goal) return;
        try {
            const res = await fetch(`/api/saving-goals/${goal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update goal");

            onUpdate();
            onClose();
            reset();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Goal</DialogTitle>
                    <DialogDescription>
                        Update progress or change the target for '{goal?.name}'.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="goal-name">Goal Name</Label>
                        <Input id="goal-name" {...register("name")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current-amount">Current Saved</Label>
                        <Input
                            id="current-amount"
                            type="number"
                            step="0.01"
                            {...register("currentAmount", { valueAsNumber: true })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="target-amount">Target</Label>
                        <Input
                            id="target-amount"
                            type="number"
                            step="0.01"
                            {...register("targetAmount", { valueAsNumber: true })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
