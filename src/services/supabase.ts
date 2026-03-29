import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
import { logger } from '../utils/logger'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

logger.debug('Supabase config:', {
  url: supabaseUrl ? 'SET' : 'MISSING',
  key: supabaseAnonKey ? 'SET' : 'MISSING',
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
