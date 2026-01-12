import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(100),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export const requestResetSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
  })
  .strict();

export const accountPayloadSchema = z
  .object({
    name: z.string().min(2).max(100),
    type: z.enum(["bank", "cash", "custom"]),
    bankName: z.string().max(120).optional().nullable(),
    accountNumber: z.string().max(120).optional().nullable(),
    icon: z.string().max(120).optional().nullable(),
    color: z.string().max(32).optional().nullable(),
    balance: z.number().optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const incomeSourceSchema = z
  .object({
    name: z.string().min(2).max(100),
    icon: z.string().max(120).optional().nullable(),
    color: z.string().max(32).optional().nullable(),
  })
  .strict();

export const categorySchema = z
  .object({
    name: z.string().min(2).max(100),
    icon: z.string().max(120).optional().nullable(),
    color: z.string().max(32).optional().nullable(),
    budget: z.number().nonnegative().optional().nullable(),
  })
  .strict();

export const incomeSchema = z
  .object({
    amount: z.number().positive(),
    description: z.string().max(255).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    date: z.coerce.date(),
    sourceId: z.string().min(1),
    accountId: z.string().min(1),
  })
  .strict();

export const expenseSchema = z
  .object({
    amount: z.number().positive(),
    description: z.string().max(255).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    merchant: z.string().max(120).optional().nullable(),
    date: z.coerce.date(),
    categoryId: z.string().min(1),
    accountId: z.string().min(1),
  })
  .strict();

export const savingGoalSchema = z
  .object({
    name: z.string().min(2).max(120),
    targetAmount: z.number().positive(),
    currentAmount: z.number().min(0).optional(),
    deadline: z.coerce.date().optional().nullable(),
    type: z.enum(["monthly", "yearly", "custom"]),
    icon: z.string().max(120).optional().nullable(),
    color: z.string().max(32).optional().nullable(),
    isCompleted: z.boolean().optional(),
  })
  .strict();

export const reportQuerySchema = z.object({
  range: z
    .enum(["thisMonth", "lastMonth", "thisYear", "lastYear", "30d", "custom"]) 
    .default("thisMonth"),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});
