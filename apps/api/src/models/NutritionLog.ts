import mongoose, { Document, Schema } from 'mongoose';

export interface INutritionLog extends Document {
  athlete_id: mongoose.Types.ObjectId;
  date: Date;
  meal_quality: number;
  hydration_ounces: number;
  supplements_taken: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const NutritionLogSchema = new Schema<INutritionLog>(
  {
    athlete_id: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true },
    date: { type: Date, required: true },
    meal_quality: { type: Number, required: true },
    hydration_ounces: { type: Number, required: true },
    supplements_taken: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.NutritionLog || mongoose.model<INutritionLog>('NutritionLog', NutritionLogSchema);
