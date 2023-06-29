import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkUserdExists(request: FastifyRequest, replay: FastifyReply) {
  const mealsSchema = z.object({
    user_id: z.string(),
  })
  const { user_id } = mealsSchema.parse(request.query)

  if (!user_id) {
    return replay.status(401).send({
      error: 'Unauthorized',
    })
  }
}
