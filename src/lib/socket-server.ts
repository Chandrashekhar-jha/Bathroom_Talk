import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: NetServer & {
            io?: SocketIOServer;
        };
    };
};

export function initSocket(res: NextApiResponseWithSocket): SocketIOServer {
    if (!res.socket.server.io) {
        const io = new SocketIOServer(res.socket.server, {
            path: '/api/socketio',
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join-stall', (groupId: string) => {
                socket.join(`stall:${groupId}`);
            });

            socket.on('leave-stall', (groupId: string) => {
                socket.leave(`stall:${groupId}`);
            });

            socket.on('new-post', (data: { groupId: string; post: unknown }) => {
                socket.to(`stall:${data.groupId}`).emit('post-created', data.post);
            });

            socket.on('vote-update', (data: { groupId: string; postId: string; upvotes: number; downvotes: number }) => {
                socket.to(`stall:${data.groupId}`).emit('post-voted', data);
            });

            socket.on('post-deleted', (data: { groupId: string; postId: string }) => {
                socket.to(`stall:${data.groupId}`).emit('post-removed', data.postId);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        res.socket.server.io = io;
    }

    return res.socket.server.io!;
}
