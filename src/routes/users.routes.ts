import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, replay) => {
    const userSchema = z.object({
      name: z.string(),
    })

    const { name } = userSchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
    })
    return replay.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select('*')
    return { users }
  })

  app.get('/details', async (request, replay) => {
    const userSchema = z.object({
      id: z.string(),
    })
    const { id } = userSchema.parse(request.query)
    const user = await knex('users')
      .where({
        id,
      })
      .select('*')
      .first()
    return { user }
  })
}
