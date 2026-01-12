import mongoose, { Schema, model, models } from 'mongoose';

// Income Model
const IncomeSchema = new Schema({
    amount: { type: Number, required: true },
    description: { type: String },
    notes: { type: String },
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'IncomeSource', required: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
}, { timestamps: true });

export const Income = models.Income || model('Income', IncomeSchema);

// Expense Model
const ExpenseSchema = new Schema({
    amount: { type: Number, required: true },
    description: { type: String },
    notes: { type: String },
    merchant: { type: String },
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
}, { timestamps: true });

export const Expense = models.Expense || model('Expense', ExpenseSchema);

// Saving Goal Model
const SavingGoalSchema = new Schema({
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    type: { type: String, required: true }, // "monthly" | "yearly" | "custom"
    icon: { type: String },
    color: { type: String },
    isCompleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const SavingGoal = models.SavingGoal || model('SavingGoal', SavingGoalSchema);

// Notification Model
const NotificationSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true }, // "alert" | "info" | "warning" | "success"
    isRead: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Notification = models.Notification || model('Notification', NotificationSchema);
