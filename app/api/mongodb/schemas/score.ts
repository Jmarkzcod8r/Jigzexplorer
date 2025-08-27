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
}

const ScoreSchema = new Schema<IScore>({
  email: { type: String, required: true },
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
});

const Score =
  (models.Score as mongoose.Model<IScore>) ||
  model<IScore>("Score", ScoreSchema);

export default Score;
