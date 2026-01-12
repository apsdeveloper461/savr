import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // Optional because of OAuth
    image: { type: String },
    emailVerified: { type: Date },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);

const AccountSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    refresh_token: { type: String },
    access_token: { type: String },
    expires_at: { type: Number },
    token_type: { type: String },
    scope: { type: String },
    id_token: { type: String },
    session_state: { type: String },
}, { timestamps: true });

// Compound index for provider + providerAccountId
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const Account = models.Account || model('Account', AccountSchema);

const SessionSchema = new Schema({
    sessionToken: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expires: { type: Date, required: true },
}, { timestamps: true });

export const Session = models.Session || model('Session', SessionSchema);

const VerificationTokenSchema = new Schema({
    identifier: { type: String, required: true },
    token: { type: String, unique: true, required: true },
    expires: { type: Date, required: true },
});

VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

export const VerificationToken = models.VerificationToken || model('VerificationToken', VerificationTokenSchema);

// Password Reset Token (Custom for Credentials Auth)
const PasswordResetSchema = new Schema({
    token: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expires: { type: Date, required: true },
}, { timestamps: true });

export const PasswordReset = models.PasswordReset || model('PasswordReset', PasswordResetSchema);
