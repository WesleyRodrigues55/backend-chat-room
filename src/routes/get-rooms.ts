import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getRooms(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/rooms', 
        async(request) => {

        const rooms = await prisma.room.findMany({
            include: {
                users: {
                    where: {
                        active: true
                    }
                }
            }
        })    

        if (!rooms) {
            throw new ClientError("Rooms not found!")
        }

        const users = rooms.map(room => room.users)

        return { rooms: rooms, users: users}

    })
}