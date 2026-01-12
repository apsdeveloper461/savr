import { getCurrentUser } from "@/lib/auth";
import { AccountsClient } from "@/components/accounts/accounts-client";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { BankAccount } from "@/models/core";

export default async function AccountsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    await dbConnect();
    // Fetch fresh data
    const accounts = await BankAccount.find({ userId: user.id }).sort({ createdAt: "asc" }).lean();

    const formattedAccounts = accounts.map(a => ({
        ...a,
        id: a._id.toString(), // Normalize ID
        _id: undefined, // Remove mongo _id
        userId: undefined,
        __v: undefined
    }));

    return <AccountsClient initialAccounts={formattedAccounts as any} />;
}
