import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { Server as SocketServer } from 'socket.io';

export async function createUser(app: FastifyInstance, io: SocketServer) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/user/:roomId', {
        schema: {
            params: z.object({
                roomId: z.string().uuid(),
            }),
            body: z.object({
                name: z.string().min(1),
            })
        }
    }, async(request) => {
        const { roomId } = request.params;
        const { name } = request.body;

        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })

        if (!room) {
            throw new ClientError('Room not found.')
        }

        const user = await prisma.user.create({
            data: {
                name,
                room_id: roomId,
                active: true
            }
        })

        const users = await prisma.user.findMany({
            where: {
                room_id: roomId
            }
        })

        io.emit('create-user', user);

        return { user: user}

    })
}