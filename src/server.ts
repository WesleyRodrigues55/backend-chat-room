import fastify from "fastify"
import cors from '@fastify/cors'

import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { env } from "./env"
import { Server as SocketServer } from 'socket.io';

import { createRoom } from "./routes/create-room"
import { getRoom } from "./routes/get-room"
import { getRooms } from "./routes/get-rooms"
import { createUser } from "./routes/create-user"
import { createMessage } from "./routes/create-message"
import { getMessage } from "./routes/get-messages"
import { updateUser } from "./routes/update-user"
import { getUser } from "./routes/get-user"
import { getUsers } from "./routes/get-users"
import { deleteRoom } from "./routes/delete-room"

const app = fastify()
const port = env.PORT || 3001;
const host = '0.0.0.0';

const io = new SocketServer(app.server, {
    cors: {
        origin: "*",
    }
});

app.register(cors, {
    origin: "*",
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createRoom, io)
app.register(createUser, io)
app.register(createMessage, io)

app.register(getRoom)
app.register(getRooms)
app.register(getMessage)
app.register(getUser)
app.register(getUsers)

app.register(updateUser, io)

app.register(deleteRoom, io)

app.listen({ host, port }).then(() => {
    console.log(`Server running on http://${host}:${port}`)
})