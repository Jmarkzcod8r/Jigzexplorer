import mongoose, { Schema, model, models, Model, Document } from "mongoose";

// Define the profile interface
export interface IProfile extends Document {
//   _id: string;
  name: string;
  email: string;
  date: Date;
}

// Define schema
const ProfileSchema = new Schema<IProfile>({
//   _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Explicitly type the model to avoid TS union issues
const Profile: Model<IProfile> =
  (models.Profile as Model<IProfile>) || model<IProfile>("Profile", ProfileSchema);

export default Profile;
