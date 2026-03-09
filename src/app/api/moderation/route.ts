import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';
import Post from '@/models/Post';
import Report from '@/models/Report';

// POST /api/moderation – Mute/unmute user or remove member
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { action, groupId, targetSession, sessionId, muteDurationMs } = await req.json();

        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });

        const requester = group.members.find((m) => m.sessionId === sessionId);
        if (!requester || requester.role !== 'creator') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const target = group.members.find((m) => m.sessionId === targetSession);
        if (!target) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

        if (action === 'mute') {
            target.mutedUntil = new Date(Date.now() + (muteDurationMs || 3600000));
            await group.save();
            return NextResponse.json({ success: true, mutedUntil: target.mutedUntil });
        }

        if (action === 'unmute') {
            target.mutedUntil = null;
            await group.save();
            return NextResponse.json({ success: true });
        }

        if (action === 'remove') {
            if (target.role === 'creator') {
                return NextResponse.json({ error: 'Cannot remove creator' }, { status: 400 });
            }
            group.members = group.members.filter((m) => m.sessionId !== targetSession);
            await group.save();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        console.error('Moderation error:', error);
        return NextResponse.json({ error: 'Failed to moderate' }, { status: 500 });
    }
}

// GET /api/moderation?groupId=xxx – Get reports for a group (admin)
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');
        const sessionId = req.headers.get('x-session-id');

        if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });

        const requester = group.members.find((m) => m.sessionId === sessionId);
        if (!requester || requester.role !== 'creator') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const posts = await Post.find({ groupId, isDeleted: false }).lean();
        const postIds = posts.map((p) => p._id.toString());
        const reports = await Report.find({ postId: { $in: postIds } }).lean();

        return NextResponse.json({ reports: reports.map(r => ({ ...r, _id: r._id.toString() })) });
    } catch (error) {
        console.error('Get reports error:', error);
        return NextResponse.json({ error: 'Failed to get reports' }, { status: 500 });
    }
}
