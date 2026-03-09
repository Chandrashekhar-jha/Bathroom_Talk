import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Report from '@/models/Report';
import Group from '@/models/Group';

// POST /api/posts/[id]/report
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const { sessionId, reason } = await req.json();

        if (!sessionId || !reason) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post || post.isDeleted) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        const group = await Group.findById(post.groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        const member = group.members.find((m) => m.sessionId === sessionId);
        if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

        await Report.create({ postId: id, reportedBy: sessionId, reason });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Report error:', error);
        return NextResponse.json({ error: 'Failed to report' }, { status: 500 });
    }
}
