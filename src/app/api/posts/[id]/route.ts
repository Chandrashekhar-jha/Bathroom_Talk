import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Group from '@/models/Group';

// DELETE /api/posts/[id] – Mod-only delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const sessionId = req.headers.get('x-session-id');

        const post = await Post.findById(id);
        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        const group = await Group.findById(post.groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });

        const member = group.members.find((m) => m.sessionId === sessionId);
        const isAuthor = post.authorSession === sessionId;
        const isMod = member?.role === 'creator';

        if (!isAuthor && !isMod) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        post.isDeleted = true;
        post.deletedBy = sessionId!;
        await post.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
