import mongoose, { Schema, model, models, Model, Document } from "mongoose";

// Define the profile interface
export interface IProfile extends Document {
  name: string;
  email: string;
  date: Date;
  premium: {
    status: string;
    subscriptionId?: string; // optional if user doesn't have subscription yet
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define schema with timestamps
const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },  // This serves as a key
    date: { type: Date, default: Date.now },
    premium: {
      status: { type: String, default: 'false', required: true },
      subscriptionId: { type: String, default: "" },
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Explicitly type the model to avoid TS union issues
const Profile: Model<IProfile> =
  (models.Profile as Model<IProfile>) || model<IProfile>("Profile", ProfileSchema);

export default Profile;
