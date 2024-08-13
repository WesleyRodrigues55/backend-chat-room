import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { Server as SocketServer } from 'socket.io';

export async function createMessage(app: FastifyInstance, io: SocketServer) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/chat-room/:roomId/:userId/create-message', {
        schema: {
            params: z.object({
                roomId: z.string().uuid(),
                userId: z.string().uuid(),
            }),
            body: z.object({
                message: z.string().min(1),
                created_at: z.coerce.date()
            }),
        }
    }, async(request) => {
        const { roomId, userId } = request.params;
        const { message, created_at } = request.body;

        const chat_room = await prisma.chatRoom.create({
            data: {
                user_id: userId,
                room_id: roomId,
                message,
                created_at,
                react: 0
            }
        })

        if (!chat_room) {
            throw new ClientError('Chat Room not found.')
        }

        const new_message = await prisma.chatRoom.findUnique({
            where: {
                id: chat_room.id
            },
            include: {
                user: true
            }
        })

        io.emit('message', new_message);

        return { chat_room: chat_room }

    })
}