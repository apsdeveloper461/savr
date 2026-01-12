"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to login");
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
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome back</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Let’s get you back in control of your money.</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" type="submit" isLoading={form.formState.isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          <Link className="text-zinc-900 underline transition hover:text-zinc-700 dark:text-zinc-100" href="/forgot-password">
            Forgot password?
          </Link>
        </p>
        <p>
          New here?{" "}
          <Link className="text-zinc-900 underline transition hover:text-zinc-700 dark:text-zinc-100" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
