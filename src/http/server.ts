import fastify from 'fastify'
import {z} from 'zod'
import { PrismaClient } from '@prisma/client';

// GET, POST, PUT(alteracao), DELETE, PATCH(alteracao de um campo especifico dentro de um recurso), HEAD, OPTIONS

const app = fastify()

const prisma = new PrismaClient()

app.post('/polls', async (request) => {
    const createPollBody = z.object({
        title: z.string()
    })

    const { title } = createPollBody.parse(request.body)

    const poll = await prisma.poll.create({
        data: {
            title,
        }
    })

    console.log(title)

    return poll
})

app.listen({ port: 3333}).then(() => {
    console.log('HTTP server runnig')
})


//ORMs