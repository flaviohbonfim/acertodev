import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityType extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityTypeSchema = new Schema<IActivityType>({
  name: {
    type: String,
    required: [true, 'Nome do tipo de atividade é obrigatório'],
    trim: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ActivityType || mongoose.model<IActivityType>('ActivityType', ActivityTypeSchema);
