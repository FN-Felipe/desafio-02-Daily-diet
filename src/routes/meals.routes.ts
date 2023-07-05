import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserdExists } from '../middlewares/check-user-id-exists'

type MealsType = {
  id: string
  name: string
  description: string
  hasOk: string
  user_id: string
  created_at: string
}

export async function mealsRoutes(app: FastifyInstance) {
  // cria uma refeição
  app.post('/', async (request, replay) => {
    const mealsSchema = z.object({
      name: z.string(),
      description: z.string(),
      hasOk: z.boolean(),
      user_id: z.string(),
    })

    const { name, description, hasOk, user_id } = mealsSchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      hasOk,
      user_id,
    })
    return replay.status(201).send()
  })

  // pega todas as refeições de todos
  app.get('/', async () => {
    const meals = await knex('meals').select('*')
    return { meals }
  })

  // pega uma refeição de um usuário específico
  app.get(
    '/meal',
    { preHandler: [checkUserdExists] },
    async (request, replay) => {
      const mealsSchema = z.object({
        user_id: z.string(),
        id: z.string(),
      })
      const { id, user_id } = mealsSchema.parse(request.query)
      const meals = await knex('meals')
        .where({
          user_id,
          id,
        })
        .select('*')
      return { meals }
    },
  )

  // pega todas as refeições de um usuário específico
  app.get(
    '/user',
    { preHandler: [checkUserdExists] },
    async (request, replay) => {
      const mealsSchema = z.object({
        user_id: z.string(),
      })
      const { user_id } = mealsSchema.parse(request.query)
      const meals = await knex('meals')
        .where({
          user_id,
        })
        .select('*')
      return { meals }
    },
  )

  // atualiza uma refeição de um usuário específico
  app.patch(
    '/user',
    { preHandler: [checkUserdExists] },
    async (request, replay) => {
      const mealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        hasOk: z.boolean(),
      })
      const mealQuerySchema = z.object({
        user_id: z.string(),
        id: z.string(),
      })

      const { user_id, id } = mealQuerySchema.parse(request.query)
      const { name, description, hasOk } = mealsSchema.parse(request.body)

      const meals = await knex('meals')
        .where({
          user_id,
          id,
        })
        .update({
          name,
          description,
          hasOk,
        })
      return { meals }
    },
  )

  // deleta uma refeição de um usuário específico
  app.delete('/user', async (request, replay) => {
    const mealsSchema = z.object({
      user_id: z.string(),
      id: z.string(),
    })

    const { user_id, id } = mealsSchema.parse(request.query)
    const meals = await knex('meals')
      .where({
        user_id,
        id,
      })
      .delete()
    return { meals }
  })

  // pega as estatísticas de um usuário específico
  app.get('/user/statistic', async (request, replay) => {
    const mealsSchema = z.object({
      user_id: z.string(),
    })
    const { user_id } = mealsSchema.parse(request.query)
    const meals = await knex('meals')
      .where({
        user_id,
      })
      .select('*')
    meals.map(meal => {
      meals.slice(meal.hasOk, )
    })

    function bestSequence(meals: MealsType[]) {
      let bestSequence: MealsType[] = []
      let currentSequence: MealsType[] = []
      let currentCount = 0
      let highestScore = 0

      meals.forEach((meal) => {
        if (meal.hasOk === '1') {
          currentSequence.push(meal)
          currentCount++
        } else {
          if (currentCount > highestScore) {
            bestSequence = currentSequence
            highestScore = currentCount
          }
          currentSequence = []
          currentCount = 0
        }
      })

      if (currentCount > highestScore) {
        bestSequence = currentSequence
      }

      return bestSequence
    }

    const bestSequences = bestSequence(meals)

    return {
      'Total de refeições': meals.length,
      'Refeições dentro da dieta': meals.filter(meal => meal.hasOk === "1").length,
      'Refeições fora da dieta': meals.filter(meal => meal.hasOk === "0").length,
      'Melhor sequência': bestSequences.length
    }
  })
}
