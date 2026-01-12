"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";
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
import { accountPayloadSchema } from "@/lib/validators";

const formSchema = accountPayloadSchema.partial();
type FormValues = z.infer<typeof formSchema>;

type Account = {
    id: string;
    name: string;
    balance: number;
};

export function EditBalanceDialog({ account, isOpen, onClose, onUpdate }: { account: Account | null, isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        values: {
            balance: account?.balance,
            name: account?.name,
        },
    });

    const onSubmit = async (data: FormValues) => {
        if (!account) return;
        try {
            const res = await fetch(`/api/accounts/${account.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update account");

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
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update the name or current balance for this account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Account Name</Label>
                        <Input id="edit-name" {...register("name")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-balance">Current Balance</Label>
                        <Input
                            id="edit-balance"
                            type="number"
                            step="0.01"
                            {...register("balance", { valueAsNumber: true })}
                        />
                        {errors.balance && <p className="text-xs text-red-500">{errors.balance.message}</p>}
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
