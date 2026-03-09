import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Group from '@/models/Group';

// POST /api/posts/[id]/poll-vote
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const { sessionId, optionIndex } = await req.json();

        if (!sessionId || optionIndex === undefined) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post || post.isDeleted || post.type !== 'poll') {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // Verify membership
        const group = await Group.findById(post.groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        const member = group.members.find((m) => m.sessionId === sessionId);
        if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

        // Remove from all options first (allows re-voting)
        post.pollOptions.forEach((opt) => {
            opt.votes = opt.votes.filter((s) => s !== sessionId);
        });

        // Add to chosen option
        if (optionIndex >= 0 && optionIndex < post.pollOptions.length) {
            post.pollOptions[optionIndex].votes.push(sessionId);
        }

        await post.save();

        const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
        return NextResponse.json({
            pollOptions: post.pollOptions.map((opt, i) => ({
                text: opt.text,
                votes: opt.votes.length,
                percentage: totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0,
                userVoted: opt.votes.includes(sessionId),
            })),
            totalVotes,
        });
    } catch (error) {
        console.error('Poll vote error:', error);
        return NextResponse.json({ error: 'Failed to vote on poll' }, { status: 500 });
    }
}
