import { Knex } from 'knex'

declare module 'kenx/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: string
    }
    meals: {
      id: string
      description: string
      created_at: string
      hasOk: booean
      userId: string
    }
  }
}
