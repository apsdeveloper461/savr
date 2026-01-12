"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    prefix?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", prefix, ...props }, ref) => {
        const isPasswordField = type === "password";
        const [showPassword, setShowPassword] = React.useState(false);

        const resolvedType = isPasswordField ? (showPassword ? "text" : "password") : type;

        return (
            <div
                className={cn(
                    "flex items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800",
                    className,
                )}
            >
                {prefix && <span className="px-3 text-sm text-zinc-500">{prefix}</span>}

                <input
                    ref={ref}
                    type={resolvedType}
                    className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-800"
                    {...props}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="px-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";
