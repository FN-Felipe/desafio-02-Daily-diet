import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { app } from '../src/app'

type UserProps = {
  id: string
  name: string
  created_at: string
}

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('should be able to create a new meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Café da Tarde',
        description: 'Chá de erva-doce com bolacha de água e sal',
        hasOk: true,
        user_id: '5f1b5cd0-d393-4eee-82e2-d3c5d44fe2e6',
      })
      .expect(201)
  })

  test('should be able to list all meals', async () => {
    await request(app.server).post('/meals').send({
      name: 'Café da Tarde',
      description: 'Chá de erva-doce com bolacha de água e sal',
      hasOk: true,
      user_id: '5f1b5cd0-d393-4eee-82e2-d3c5d44fe2e6',
    })

    await request(app.server).get('/meals').expect(200)
  })

  test('should be able get meals by user_id', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
    })

    await request(app.server).post('/meals').send({
      name: 'Café da Tarde',
      description: 'Chá de erva-doce com bolacha de água e sal',
      hasOk: true,
      user_id: '5f1b5cd0-d393-4eee-82e2-d3c5d44fe2e6',
    })

    const allUsers = await request(app.server).get('/users')

    const user: UserProps = allUsers.body.users[0]

    const getMeals = await request(app.server)
      .get(`meals/user`)
      .query(`user_id=${user.id}`)

    expect(getMeals.body).toEqual(
      expect.objectContaining({
        name: 'Café da Tarde'
      }),
    )
  })
})
