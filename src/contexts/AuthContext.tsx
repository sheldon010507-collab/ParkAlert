import React from 'react'
import { Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthErrorWithMessage {
  error: AuthError | null
  profileError?: string | null
}

interface AuthContextType {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthErrorWithMessage>
  signUp: (email: string, password: string) => Promise<AuthErrorWithMessage>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType>({
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    })

    if (!error && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: email.split('@')[0],
        reputation: 0,
      })
      if (profileError) {
        return { error: null, profileError: 'Account created but profile setup failed. Please contact support.' }
      }
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => React.useContext(AuthContext)
