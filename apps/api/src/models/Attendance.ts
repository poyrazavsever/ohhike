import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  session_id: mongoose.Types.ObjectId;
  athlete_id: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'excused' | 'injured';
  created_at: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    athlete_id: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true },
    status: { type: String, enum: ['present', 'absent', 'excused', 'injured'], default: 'present' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

AttendanceSchema.index({ session_id: 1, athlete_id: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
