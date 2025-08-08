import postgres from 'postgres'
import 'dotenv/config'

if (process.env.DATABASE_URL === null || process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === '') throw new Error('DATABASE_URL env not found')

const sql = postgres(process.env.DATABASE_URL)

export default sql
