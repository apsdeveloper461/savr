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
import { accountPayloadSchema } from "@/lib/validators";

const formSchema = accountPayloadSchema;
type FormValues = z.infer<typeof formSchema>;

export function AddAccountDialog({ onAccountAdded }: { onAccountAdded: () => void }) {
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
            type: "bank",
            balance: 0,
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create account");

            onAccountAdded();
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
                    <Plus className="h-4 w-4" /> Add Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                    <DialogDescription>
                        Create a new bank account or cash wallet to track.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Account Name</Label>
                        <Input id="name" placeholder="e.g. Chase Checking" {...register("name")} />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select onValueChange={(val) => setValue("type", val as "bank" | "cash" | "custom")} defaultValue={watch("type")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Bank Account</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="custom">Other / Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance">Current Balance</Label>
                        <Input
                            id="balance"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register("balance", { valueAsNumber: true })}
                        />
                        {errors.balance && <p className="text-xs text-red-500">{errors.balance.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
