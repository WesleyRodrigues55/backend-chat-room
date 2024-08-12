import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { Server as SocketServer } from 'socket.io';

export async function deleteRoom(app: FastifyInstance, io: SocketServer) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/room/:roomId', {
        schema: {
            params: z.object({
                roomId: z.string().uuid(),
            }),
        }
    }, async(request) => {
        const { roomId } = request.params;

        const room = await prisma.room.findFirst({
            where: {
                id: roomId
            },
            include: {
                users: true
            }
        })
        
        if (!room) {
            throw new ClientError("Room not found.")
        }

        await prisma.chatRoom.deleteMany({
            where: {
                room_id: roomId,
            }
        })

        await prisma.user.deleteMany({
            where: {
                room_id: roomId,
            }
        })

        await prisma.room.delete({
            where: {
                id: roomId,
            }
        })

        io.emit('delete-room', { id: roomId });

        return { message: "Room deleted." }

    })
}