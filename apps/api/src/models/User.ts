import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  locale: string;
  timezone: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    phone: { type: String },
    locale: { type: String, default: "tr" },
    timezone: { type: String, default: "Europe/Istanbul" },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
