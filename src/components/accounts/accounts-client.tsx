"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Wallet, CreditCard, Banknote } from "lucide-react"; // Corrected icon imports
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddAccountDialog } from "./add-account-dialog";
import { EditBalanceDialog } from "./edit-balance-dialog";

type Account = {
    id: string;
    name: string;
    type: string;
    balance: number;
    bankName?: string | null;
};

export function AccountsClient({ initialAccounts }: { initialAccounts: Account[] }) {
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const refreshAccounts = async () => {
        const res = await fetch("/api/accounts");
        if (res.ok) {
            const data = await res.json();
            setAccounts(data.accounts);
        }
    };

    const deleteAccount = async (id: string) => {
        if (!confirm("Are you sure? This will hide related history.")) return;
        try {
            const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
            if (res.ok) refreshAccounts();
        } catch (e) { console.error(e); }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Manage your bank accounts, cash wallets, and other funds.
                    </p>
                </div>
                <AddAccountDialog onAccountAdded={refreshAccounts} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                    <Card key={account.id} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {account.name}
                            </CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingAccount(account)}>
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => deleteAccount(account.id)} className="text-red-600">
                                        Delete Account
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                {account.type === 'CASH' ? <Banknote className="h-4 w-4 text-zinc-500" /> : <CreditCard className="h-4 w-4 text-zinc-500" />}
                                <span className="text-xs text-zinc-500 font-medium tracking-wider uppercase">{account.type}</span>
                            </div>
                            <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {account.bankName || "Manual Tracking"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <EditBalanceDialog
                account={editingAccount}
                isOpen={!!editingAccount}
                onClose={() => setEditingAccount(null)}
                onUpdate={refreshAccounts}
            />
        </div>
    );
}
