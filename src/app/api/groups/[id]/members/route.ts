import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

// GET /api/groups/[id]/members – Admin only member list
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const sessionId = req.headers.get('x-session-id');

        const group = await Group.findById(id);
        if (!group) return NextResponse.json({ error: 'Stall not found' }, { status: 404 });

        const requester = group.members.find((m) => m.sessionId === sessionId);
        if (!requester || requester.role !== 'creator') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const members = group.members.map((m) => ({
            anonymousName: m.anonymousName,
            role: m.role,
            mutedUntil: m.mutedUntil,
            joinedAt: m.joinedAt,
            sessionId: m.sessionId,
        }));

        return NextResponse.json({ members });
    } catch (error) {
        console.error('Get members error:', error);
        return NextResponse.json({ error: 'Failed to get members' }, { status: 500 });
    }
}
