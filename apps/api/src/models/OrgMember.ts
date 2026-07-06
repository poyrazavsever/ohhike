import mongoose, { Document, Schema } from 'mongoose';

export interface IOrgMember extends Document {
  organization_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'staff' | 'athlete';
  created_at: Date;
  updated_at: Date;
}

const OrgMemberSchema = new Schema<IOrgMember>(
  {
    organization_id: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'staff', 'athlete'], default: 'athlete' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

OrgMemberSchema.index({ organization_id: 1, user_id: 1 }, { unique: true });

export default mongoose.models.OrgMember || mongoose.model<IOrgMember>('OrgMember', OrgMemberSchema);
