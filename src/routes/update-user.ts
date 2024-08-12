import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { Server as SocketServer } from 'socket.io';

export async function updateUser(app: FastifyInstance, io: SocketServer) {
    app.withTypeProvider<ZodTypeProvider>().put(
        '/user/:id', {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        }
    }, async(request) => {
        const { id } = request.params;

        const user = await prisma.user.findFirst({
            where: {
                id
            }
        })

        if (!user) {
            throw new ClientError('User not found.')
        }

        await prisma.user.update({
            data: {
                active: false
            },
            where: {
                id
            }
        })

        io.emit('update-user', user);

        return { message: "User deactivated in the room." }
    })
}