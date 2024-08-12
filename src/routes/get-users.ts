import z from "zod";

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getUsers(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/users', {
    }, async(request) => {

        const users = await prisma.user.findMany({})    

        if (!users) {
            throw new ClientError("Users not found!")
        }

        return { users: users }

    })
}