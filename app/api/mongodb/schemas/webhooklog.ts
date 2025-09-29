import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IWebhookLog extends Document {
  eventType: string;
  dataId: string;
  status: string;
  eventData?: any;
  signature?: string;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  errorStack?: string;
  processedAt: Date;
  createdAt: Date;   // 👈 will be auto-generated
  updatedAt: Date;   // 👈 will be auto-updated
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    eventType: {
      type: String,
      required: true,
      index: true
    },
    dataId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'error', 'processing', 'invalid_signature', 'missing_data'],
      index: true
    },
    eventData: {
      type: Schema.Types.Mixed
    },
    signature: {
      type: String
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    errorMessage: {
      type: String
    },
    errorStack: {
      type: String
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // ✅ auto adds createdAt & updatedAt
);

// Compound indexes for better query performance
WebhookLogSchema.index({ eventType: 1, createdAt: -1 });
WebhookLogSchema.index({ status: 1, createdAt: -1 });
WebhookLogSchema.index({ dataId: 1, eventType: 1 });

const WebhookLog =
  (models.WebhookLog as mongoose.Model<IWebhookLog>) ||
  model<IWebhookLog>("WebhookLog", WebhookLogSchema);

export default WebhookLog;