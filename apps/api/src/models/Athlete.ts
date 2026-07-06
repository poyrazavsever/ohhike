import mongoose, { Document, Schema } from 'mongoose';

export interface IAthlete extends Document {
  team_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  first_name: string;
  last_name?: string;
  email?: string;
  status: 'active' | 'injured' | 'inactive';
  position?: string;
  created_at: Date;
  updated_at: Date;
}

const AthleteSchema = new Schema<IAthlete>(
  {
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String },
    status: { type: String, enum: ['active', 'injured', 'inactive'], default: 'active' },
    position: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Athlete || mongoose.model<IAthlete>('Athlete', AthleteSchema);
