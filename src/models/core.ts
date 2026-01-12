import mongoose, { Schema, model, models } from 'mongoose';

// Bank Account Model
const BankAccountSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // "bank" | "cash" | "custom"
    bankName: { type: String },
    accountNumber: { type: String },
    balance: { type: Number, default: 0 },
    icon: { type: String },
    color: { type: String },
    isDefault: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const BankAccount = models.BankAccount || model('BankAccount', BankAccountSchema);

// Category Model
const CategorySchema = new Schema({
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    budget: { type: Number },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Category = models.Category || model('Category', CategorySchema);

// Income Source Model
const IncomeSourceSchema = new Schema({
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const IncomeSource = models.IncomeSource || model('IncomeSource', IncomeSourceSchema);
