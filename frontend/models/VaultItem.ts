import mongoose, { Document, Schema } from 'mongoose';

export interface IVaultItem extends Document {
  title: string;
  username: string;
  password: string; // This will be encrypted
  url?: string;
  notes?: string;
  userId: mongoose.Types.ObjectId;
  // Encryption fields
  ciphertext?: string;
  iv?: string;
  salt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      maxlength: [100, 'Username cannot exceed 100 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    url: {
      type: String,
      trim: true,
      maxlength: [500, 'URL cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster user-specific queries
    },
    // Encryption metadata (for future enhanced encryption)
    ciphertext: {
      type: String,
    },
    iv: {
      type: String,
    },
    salt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
VaultItemSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.VaultItem || 
  mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);