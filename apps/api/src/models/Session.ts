import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  team_id: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  duration_minutes: number;
  type: string;
  created_at: Date;
  updated_at: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    duration_minutes: { type: Number, required: true },
    type: { type: String, default: 'training' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
