import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IScore extends Document {
  email: string;
  tickets: number;
  overallScore: number;
  countries: {
    [key: string]: {
      unlock: boolean;
      score: number;
      datePlayed: Date;
    };
  };
  createdAt: Date;   // 👈 will be auto-generated
  updatedAt: Date;   // 👈 will be auto-updated
}

const ScoreSchema = new Schema<IScore>(
  {
    email: { type: String, required: true, unique: true }, // This serves as a key
    tickets: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    countries: {
      type: Map,
      of: new Schema(
        {
          unlock: { type: Boolean, default: false },
          score: { type: Number, default: 0 },
          datePlayed: { type: Date },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true } // ✅ auto adds createdAt & updatedAt
);

const Score =
  (models.Score as mongoose.Model<IScore>) ||
  model<IScore>("Score", ScoreSchema);

export default Score;
