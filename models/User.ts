import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'viewer'],
    default: 'viewer',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
