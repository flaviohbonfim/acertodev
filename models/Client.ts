import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  cnpj?: string;
  email?: string;
  hourlyRate: number;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: [true, 'Nome do cliente é obrigatório'],
    trim: true,
  },
  cnpj: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Valor por hora é obrigatório'],
    min: 0,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
