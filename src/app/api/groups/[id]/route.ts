import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

// GET /api/groups/[id] – Get group info
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const sessionId = req.headers.get('x-session-id');

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        }

        const member = group.members.find((m) => m.sessionId === sessionId);
        if (!member) {
            return NextResponse.json({ error: 'Not a member of this stall' }, { status: 403 });
        }

        return NextResponse.json({
            _id: group._id.toString(),
            name: group.name,
            description: group.description,
            inviteCode: group.inviteCode,
            memberCount: group.members.length,
            creatorSession: group.creatorSession,
            currentMember: {
                anonymousName: member.anonymousName,
                role: member.role,
                mutedUntil: member.mutedUntil,
            },
            createdAt: group.createdAt,
        });
    } catch (error) {
        console.error('Get group error:', error);
        return NextResponse.json({ error: 'Failed to get group' }, { status: 500 });
    }
}
