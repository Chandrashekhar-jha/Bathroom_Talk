import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Group from '@/models/Group';

// POST /api/posts/[id]/vote
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const { sessionId, value } = await req.json(); // value: 1 or -1

        if (!sessionId || (value !== 1 && value !== -1)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post || post.isDeleted) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        // Verify membership
        const group = await Group.findById(post.groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        const member = group.members.find((m) => m.sessionId === sessionId);
        if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

        // Remove existing votes
        post.upvotes = post.upvotes.filter((s) => s !== sessionId);
        post.downvotes = post.downvotes.filter((s) => s !== sessionId);

        // Toggle: if clicking same vote again, it removes (already removed above)
        // Otherwise add new vote
        const hadUpvote = value === 1;
        const alreadyVoted = (value === 1 && post.upvotes.includes(sessionId)) ||
            (value === -1 && post.downvotes.includes(sessionId));

        if (!alreadyVoted) {
            if (value === 1) post.upvotes.push(sessionId);
            else post.downvotes.push(sessionId);
        }

        await post.save();

        return NextResponse.json({
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length,
            userVote: post.upvotes.includes(sessionId) ? 1 : post.downvotes.includes(sessionId) ? -1 : 0,
        });
    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}
