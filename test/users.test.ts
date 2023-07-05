import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { app } from '../src/app'

describe('Users routes', () => {
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

  test('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(201)
  })

  test('should be able to list all users', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
    })

    await request(app.server).get('/users').expect(200)
  })

  test('should be able get user by id', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
    })

    const allUsers = await request(app.server).get('/users')

    const userId = allUsers.body.users[0].id

    const getUser = await request(app.server).get(`/users/details`).query(`id=${userId}`)

    expect(getUser.body.user).toEqual(
      expect.objectContaining({
        name: 'John Doe',
      }),
    )
  })
})
