import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';
import { customAlphabet } from 'nanoid';
import { generateAnonymousName } from '@/lib/anonymous-names';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

// POST /api/groups – Create a new stall
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { name, description, sessionId } = await req.json();

        if (!name || !sessionId) {
            return NextResponse.json({ error: 'Name and sessionId are required' }, { status: 400 });
        }

        const inviteCode = nanoid();
        const creatorName = generateAnonymousName();

        const group = await Group.create({
            name: name.trim(),
            description: description?.trim() || '',
            inviteCode,
            creatorSession: sessionId,
            members: [{
                sessionId,
                anonymousName: creatorName,
                role: 'creator',
                joinedAt: new Date(),
            }],
        });

        return NextResponse.json({
            groupId: group._id.toString(),
            inviteCode: group.inviteCode,
            anonymousName: creatorName,
            name: group.name,
            description: group.description,
        }, { status: 201 });
    } catch (error) {
        console.error('Create group error:', error);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
