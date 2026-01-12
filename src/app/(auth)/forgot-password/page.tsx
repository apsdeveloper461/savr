"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestResetSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { z } from "zod";

type ResetRequestValues = z.infer<typeof requestResetSchema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetRequestValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setStatus(null);

      const response = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to process request");
      }

      setStatus("If your email exists with us, you’ll receive a reset link shortly.");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Forgot your password?</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">We’ll send you a secure link to get back in.</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        {status && <p className="text-sm text-emerald-600">{status}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" type="submit" isLoading={form.formState.isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Remembered your password?{" "}
        <Link className="text-zinc-900 underline transition hover:text-zinc-700 dark:text-zinc-100" href="/login">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
