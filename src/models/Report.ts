import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
    postId: string;
    reportedBy: string;
    reason: string;
    createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        postId: { type: String, required: true, index: true },
        reportedBy: { type: String, required: true },
        reason: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: true }
);

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
