import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonalTraining extends Document {
  athlete_id: mongoose.Types.ObjectId;
  date: Date;
  duration_minutes: number;
  type: string;
  intensity: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const PersonalTrainingSchema = new Schema<IPersonalTraining>(
  {
    athlete_id: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true },
    date: { type: Date, required: true },
    duration_minutes: { type: Number, required: true },
    type: { type: String, required: true },
    intensity: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.PersonalTraining || mongoose.model<IPersonalTraining>('PersonalTraining', PersonalTrainingSchema);
