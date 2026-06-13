import type { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError): string {
  const status = 'status' in error ? error.status : undefined
  const code = 'code' in error ? error.code : undefined
  const message = error.message.toLowerCase()

  if (
    status === 429 ||
    code === 'over_request_rate_limit' ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return 'Too many attempts. Please wait a minute before trying again.'
  }

  if (message.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }

  if (message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.'
  }

  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'This email is already registered. Please sign in instead.'
  }

  return error.message
}

export function isRateLimitError(error: AuthError): boolean {
  const status = 'status' in error ? error.status : undefined
  const code = 'code' in error ? error.code : undefined
  const message = error.message.toLowerCase()

  return (
    status === 429 ||
    code === 'over_request_rate_limit' ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  )
}
