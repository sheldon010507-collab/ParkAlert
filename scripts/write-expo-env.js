const fs = require('fs')
const path = require('path')

const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
]

const missing = requiredVars.filter((key) => !process.env[key])

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

const envFile = requiredVars
  .map((key) => `${key}=${process.env[key]}`)
  .join('\n')

const generatedModule = `export const env = ${JSON.stringify(
  Object.fromEntries(requiredVars.map((key) => [key, process.env[key]])),
  null,
  2,
)} as const\n`

fs.writeFileSync(path.join(process.cwd(), '.env.production'), `${envFile}\n`)
fs.mkdirSync(path.join(process.cwd(), 'src', 'config'), { recursive: true })
fs.writeFileSync(path.join(process.cwd(), 'src', 'config', 'env.generated.ts'), generatedModule)

console.log(`Wrote .env.production and src/config/env.generated.ts with ${requiredVars.length} Expo public env vars`)
