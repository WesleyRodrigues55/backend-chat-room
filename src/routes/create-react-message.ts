import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { Server as SocketServer } from 'socket.io';

export async function reactMessage(app: FastifyInstance, io: SocketServer) {
    app.withTypeProvider<ZodTypeProvider>().put(
        '/chat-room/:chatRoomId/:userId/:roomId/react-message', {
        schema: {
            params: z.object({
                chatRoomId: z.string().uuid(),
                userId: z.string().uuid(),
                roomId: z.string().uuid(),
            }),
        }
    }, async(request) => {
        const { chatRoomId, userId, roomId } = request.params;

        const reaction = await prisma.reaction.findFirst({
            where: {
                chat_room_id: chatRoomId,
                user_id: userId
            }
        })

        if (!reaction) {
            const createReaction = await prisma.reaction.create({
                data: {
                    chat_room_id: chatRoomId,
                    user_id: userId,
                    room_id: roomId
                }
            })
            
            if (!createReaction) {
                throw new ClientError('Create Reaction not found.')
            }
    
            io.emit('reaction', createReaction);
    
            return { createReaction: createReaction }
        }

        const deleteReaction = await prisma.reaction.delete({
            where: {
                id: reaction.id
            }
        })

        if (!deleteReaction) {
            throw new ClientError('Delete Reaction not found')
        }

        io.emit('reaction', deleteReaction);

        return { deleteReaction: deleteReaction }
    })
}