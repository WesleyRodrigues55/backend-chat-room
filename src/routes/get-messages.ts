import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getMessage(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/chat-room/:roomId/messages', {
        schema: {
            params: z.object({
                roomId: z.string().uuid(),
            }),
        }
    }, async(request) => {
        const { roomId } = request.params;

        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })

        if (!room) {
            throw new ClientError('Room not found.')
        }

        const chat_room = await prisma.chatRoom.findMany({
            where: {
                room_id: roomId
            },
            include: {
                user: true,
                reaction: true
            }
        })

        if (!chat_room) {
            throw new ClientError('Chat Room not found.')
        }

        return { messages: chat_room }

    })
}