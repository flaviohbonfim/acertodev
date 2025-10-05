import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeEntry extends Document {
  date: Date;
  hours: number;
  description: string;
  activityTypeId: mongoose.Types.ObjectId;
  target: {
    type: 'client' | 'group';
    id: mongoose.Types.ObjectId;
  };
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>({
  date: {
    type: Date,
    required: [true, 'Data é obrigatória'],
  },
  hours: {
    type: Number,
    required: [true, 'Horas são obrigatórias'],
    min: 0.1,
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
  },
  activityTypeId: {
    type: Schema.Types.ObjectId,
    ref: 'ActivityType',
    required: true,
  },
  target: {
    type: {
      type: String,
      enum: ['client', 'group'],
      required: true,
    },
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
