import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { Server as SocketServer } from 'socket.io';
import { ClientError } from "../errors/client-error";

export async function createRoom(app: FastifyInstance, io: SocketServer) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/room', {
        schema: {
            body: z.object({
                name: z.string().min(2),
                created_at: z.coerce.date(),
                username: z.string().min(1)
            })
        }
    }, async(request) => {
        const { name, created_at, username } = request.body;

        const room = await prisma.room.create({
            data: {
                name,
                created_at,
            }
        })

        if (!room) {
            throw new ClientError('Error in creating the Room.')
        }

        const user = await prisma.user.create({
            data: {
                name: username,
                room_id: room.id,
                active: true
            }
        })

        if (!user) {
            throw new ClientError('Error in creating the User.')
        }

        io.to('index-room').emit('create-user', user);
        io.to('index-room').emit('create-room', room);

        return { roomId: room.id, userId: user.id}
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('join-index', () => {
            socket.join('index-room');
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}