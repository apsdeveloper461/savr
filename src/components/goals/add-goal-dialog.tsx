"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savingGoalSchema } from "@/lib/validators";

const formSchema = savingGoalSchema;
type FormValues = z.infer<typeof formSchema>;

export function AddGoalDialog({ onGoalAdded }: { onGoalAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            targetAmount: 0,
            currentAmount: 0,
            type: "EMERGENCY",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await fetch("/api/saving-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create goal");

            onGoalAdded();
            setOpen(false);
            reset();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Goal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Saving Goal</DialogTitle>
                    <DialogDescription>
                        Set a target for a purchase, emergency fund, or investment.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Goal Name</Label>
                        <Input id="name" placeholder="e.g. New Car" {...register("name")} />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAmount">Target Amount</Label>
                        <Input
                            id="targetAmount"
                            type="number"
                            step="0.01"
                            {...register("targetAmount", { valueAsNumber: true })}
                        />
                        {errors.targetAmount && <p className="text-xs text-red-500">{errors.targetAmount.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentAmount">Starting Amount (Optional)</Label>
                        <Input
                            id="currentAmount"
                            type="number"
                            step="0.01"
                            {...register("currentAmount", { valueAsNumber: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deadline">Target Date (Optional)</Label>
                        <Input
                            id="deadline"
                            type="date"
                            {...register("deadline", { valueAsDate: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Category</Label>
                        <Select onValueChange={(val) => setValue("type", val as any)} defaultValue={watch("type")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EMERGENCY">Emergency Fund</SelectItem>
                                <SelectItem value="VACATION">Vacation</SelectItem>
                                <SelectItem value="VEHICLE">Vehicle</SelectItem>
                                <SelectItem value="HOME">Home</SelectItem>
                                <SelectItem value="INVESTMENT">Investment</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
