import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  organization_id: mongoose.Types.ObjectId;
  name: string;
  created_at: Date;
  updated_at: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    organization_id: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
