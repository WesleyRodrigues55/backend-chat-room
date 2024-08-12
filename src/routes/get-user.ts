import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/user/:userId', {
        schema: {
            params: z.object({
                userId: z.string().uuid(),
            })
        }
    }, async(request) => {
        const { userId } = request.params;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })    

        if (!user) {
            throw new ClientError("User not found!")
        }

        return { user: user }

    })
}