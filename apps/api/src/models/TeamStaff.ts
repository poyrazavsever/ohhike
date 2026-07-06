import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamStaff extends Document {
  team_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  role: 'head_coach' | 'assistant_coach' | 'medical' | 'viewer';
  created_at: Date;
  updated_at: Date;
}

const TeamStaffSchema = new Schema<ITeamStaff>(
  {
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['head_coach', 'assistant_coach', 'medical', 'viewer'], default: 'assistant_coach' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

TeamStaffSchema.index({ team_id: 1, user_id: 1 }, { unique: true });

export default mongoose.models.TeamStaff || mongoose.model<ITeamStaff>('TeamStaff', TeamStaffSchema);
