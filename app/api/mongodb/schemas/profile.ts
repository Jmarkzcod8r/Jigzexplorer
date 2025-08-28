import mongoose, { Schema, model, models, Model, Document } from "mongoose";

// Define the profile interface
export interface IProfile extends Document {
  name: string;
  email: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema with timestamps
const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },  // This serves as a key
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Explicitly type the model to avoid TS union issues
const Profile: Model<IProfile> =
  (models.Profile as Model<IProfile>) || model<IProfile>("Profile", ProfileSchema);

export default Profile;