import mongoose, { Schema } from "mongoose";
import { ReportStatusEnum } from "../enums/report.enum";

export interface ReportDocument extends Document {
  userId: mongoose.Types.ObjectId;
  period: string;
  sentDate: Date;
  status: keyof typeof ReportStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<ReportDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    period: { type: String, required: true },
    sentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ReportStatusEnum),
      default: ReportStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const ReportModel = mongoose.model<ReportDocument>("Report", reportSchema);

export default ReportModel;
