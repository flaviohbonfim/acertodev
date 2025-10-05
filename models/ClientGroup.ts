import mongoose, { Document, Schema } from 'mongoose';

export interface IClientGroup extends Document {
  name: string;
  clientIds: mongoose.Types.ObjectId[];
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientGroupSchema = new Schema<IClientGroup>({
  name: {
    type: String,
    required: [true, 'Nome do grupo é obrigatório'],
    trim: true,
  },
  clientIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ClientGroup || mongoose.model<IClientGroup>('ClientGroup', ClientGroupSchema);
