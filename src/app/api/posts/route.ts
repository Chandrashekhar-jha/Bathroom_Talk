import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Group from '@/models/Group';

// GET /api/posts?groupId=xxx&page=1 – Get posts for a group
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const sessionId = req.headers.get('x-session-id');

        if (!groupId) return NextResponse.json({ error: 'groupId is required' }, { status: 400 });

        // Verify membership
        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        const member = group.members.find((m) => m.sessionId === sessionId);
        if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

        const posts = await Post.find({ groupId, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const serialized = posts.map((p) => ({
            ...p,
            _id: p._id.toString(),
            userVote: p.upvotes.includes(sessionId!) ? 1 : p.downvotes.includes(sessionId!) ? -1 : 0,
        }));

        return NextResponse.json({ posts: serialized, page, hasMore: posts.length === limit });
    } catch (error) {
        console.error('Get posts error:', error);
        return NextResponse.json({ error: 'Failed to get posts' }, { status: 500 });
    }
}

// POST /api/posts – Create a new post
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { groupId, content, type, pollOptions, sessionId } = await req.json();

        if (!groupId || !content || !sessionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify membership and check mute
        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        const member = group.members.find((m) => m.sessionId === sessionId);
        if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

        if (member.mutedUntil && new Date(member.mutedUntil) > new Date()) {
            return NextResponse.json({ error: 'You are muted in this stall' }, { status: 403 });
        }

        const postData: Record<string, unknown> = {
            groupId,
            authorSession: sessionId,
            anonymousName: member.anonymousName,
            content: content.trim(),
            type: type || 'post',
        };

        if (type === 'poll' && Array.isArray(pollOptions)) {
            postData.pollOptions = pollOptions.map((text: string) => ({ text, votes: [] }));
        }

        const post = await Post.create(postData);

        return NextResponse.json({
            ...post.toObject(),
            _id: post._id.toString(),
            userVote: 0,
        }, { status: 201 });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
