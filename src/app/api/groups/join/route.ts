import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

// POST /api/groups/join – Join a stall via invite code
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { inviteCode, sessionId } = await req.json();

        if (!inviteCode || !sessionId) {
            return NextResponse.json({ error: 'inviteCode and sessionId are required' }, { status: 400 });
        }

        const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!group) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        }

        // Check if already a member
        const existing = group.members.find((m) => m.sessionId === sessionId);
        if (existing) {
            return NextResponse.json({
                groupId: group._id.toString(),
                anonymousName: existing.anonymousName,
                name: group.name,
                description: group.description,
                inviteCode: group.inviteCode,
                role: existing.role,
            });
        }

        // Generate unique name within group
        const { generateUniqueNameForGroup } = await import('@/lib/anonymous-names');
        const existingNames = group.members.map((m) => m.anonymousName);
        const anonymousName = generateUniqueNameForGroup(existingNames);

        group.members.push({
            sessionId,
            anonymousName,
            role: 'member',
            joinedAt: new Date(),
        });
        await group.save();

        return NextResponse.json({
            groupId: group._id.toString(),
            anonymousName,
            name: group.name,
            description: group.description,
            inviteCode: group.inviteCode,
            role: 'member',
        });
    } catch (error) {
        console.error('Join group error:', error);
        return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
    }
}
