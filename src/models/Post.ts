import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPollOption {
    text: string;
    votes: string[]; // sessionIds
}

export interface IPost extends Document {
    groupId: string;
    authorSession: string;
    anonymousName: string;
    content: string;
    type: 'post' | 'confession' | 'poll';
    upvotes: string[];
    downvotes: string[];
    pollOptions: IPollOption[];
    isDeleted: boolean;
    deletedBy?: string;
    createdAt: Date;
}

const PollOptionSchema = new Schema<IPollOption>({
    text: { type: String, required: true },
    votes: [{ type: String }],
});

const PostSchema = new Schema<IPost>(
    {
        groupId: { type: String, required: true, index: true },
        authorSession: { type: String, required: true },
        anonymousName: { type: String, required: true },
        content: { type: String, required: true, maxlength: 5000 },
        type: { type: String, enum: ['post', 'confession', 'poll'], default: 'post' },
        upvotes: [{ type: String }],
        downvotes: [{ type: String }],
        pollOptions: [PollOptionSchema],
        isDeleted: { type: Boolean, default: false },
        deletedBy: { type: String },
    },
    { timestamps: true }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
export default Post;
