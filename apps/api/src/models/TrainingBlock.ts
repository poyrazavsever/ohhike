import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingBlock extends Document {
  session_id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  duration_minutes: number;
  created_at: Date;
}

const TrainingBlockSchema = new Schema<ITrainingBlock>(
  {
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    duration_minutes: { type: Number, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export default mongoose.models.TrainingBlock || mongoose.model<ITrainingBlock>('TrainingBlock', TrainingBlockSchema);
