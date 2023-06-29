import { config } from 'dotenv'
import { z } from 'zod'

process.env.NODE_ENV === 'test' ? config({ path: '.env.test' }) : config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(5454),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment varibles', _env.error.format())
  throw new Error('Invalid environment varibles')
}

export const env = _env.data
