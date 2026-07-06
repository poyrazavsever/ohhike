import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
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
    email: { type: String, required: true, unique: true },
    password: { type: String },
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
