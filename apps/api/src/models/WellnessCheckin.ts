import mongoose, { Document, Schema } from 'mongoose';

export interface IWellnessCheckin extends Document {
  athlete_id: mongoose.Types.ObjectId;
  date: Date;
  readiness_score: number;
  fatigue_level: number;
  sleep_quality: number;
  sleep_hours: number;
  soreness_level: number;
  stress_level: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const WellnessCheckinSchema = new Schema<IWellnessCheckin>(
  {
    athlete_id: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true },
    date: { type: Date, required: true },
    readiness_score: { type: Number, required: true },
    fatigue_level: { type: Number, required: true },
    sleep_quality: { type: Number, required: true },
    sleep_hours: { type: Number, required: true },
    soreness_level: { type: Number, required: true },
    stress_level: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.WellnessCheckin || mongoose.model<IWellnessCheckin>('WellnessCheckin', WellnessCheckinSchema);
