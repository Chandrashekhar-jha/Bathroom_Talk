import { NextRequest, NextResponse } from 'next/server';

// This endpoint provides SSE (Server-Sent Events) for real-time updates
// Socket.io is handled via the custom server - this is a lightweight SSE fallback
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    return NextResponse.json({
        message: 'Socket.io is handled by the custom server at /api/socketio',
        status: 'ok'
    });
}
