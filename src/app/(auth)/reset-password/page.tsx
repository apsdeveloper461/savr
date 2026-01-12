"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { z } from "zod";

type ResetValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
    },
  });

  useEffect(() => {
    form.setValue("token", token);
  }, [token, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to reset password");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Reset password</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Choose a strong password to secure your account.</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <input type="hidden" {...form.register("token")} />

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" type="submit" isLoading={form.formState.isSubmitting}>
          Update password
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Know your password?{" "}
        <Link className="text-zinc-900 underline transition hover:text-zinc-700 dark:text-zinc-100" href="/login">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
