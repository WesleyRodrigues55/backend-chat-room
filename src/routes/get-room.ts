import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getRoom(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/room/:roomId', {
        schema: {
            params: z.object({
                roomId: z.string().uuid(),
            })
        }
    }, async(request) => {
        const { roomId } = request.params;

        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                users: {
                    where: {
                        active: true
                    }
                }
            }
        })    

        if (!room) {
            throw new ClientError("Room not found!")
        }

        return { room: room }

    })
}