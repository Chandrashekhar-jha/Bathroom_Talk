import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember {
    sessionId: string;
    anonymousName: string;
    role: 'creator' | 'member';
    mutedUntil?: Date | null;
    joinedAt: Date;
}

export interface IGroup extends Document {
    name: string;
    description: string;
    inviteCode: string;
    creatorSession: string;
    members: IMember[];
    createdAt: Date;
}

const MemberSchema = new Schema<IMember>({
    sessionId: { type: String, required: true },
    anonymousName: { type: String, required: true },
    role: { type: String, enum: ['creator', 'member'], default: 'member' },
    mutedUntil: { type: Date, default: null },
    joinedAt: { type: Date, default: Date.now },
});

const GroupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true, trim: true, maxlength: 60 },
        description: { type: String, default: '', maxlength: 300 },
        inviteCode: { type: String, required: true, unique: true, uppercase: true },
        creatorSession: { type: String, required: true },
        members: [MemberSchema],
    },
    { timestamps: true }
);

const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export default Group;
