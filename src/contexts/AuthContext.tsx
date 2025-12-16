import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (username: string, password: string, confirmPassword: string, invitationCode: string) => Promise<{ error: Error | null }>
  signIn: (username: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (username: string, password: string, confirmPassword: string, invitationCode: string) => {
    try {
      if (password !== confirmPassword) {
        return { error: new Error('Passwords do not match') }
      }

      if (password.length < 6) {
        return { error: new Error('Password must be at least 6 characters') }
      }

      if (!username || username.length < 3) {
        return { error: new Error('Username must be at least 3 characters') }
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (existingProfile) {
        return { error: new Error('Username already taken') }
      }

      const { data: inviteData, error: inviteError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', invitationCode)
        .eq('is_used', false)
        .maybeSingle()

      if (inviteError || !inviteData) {
        return { error: new Error('Invalid or already used invitation code') }
      }

      const email = `${username.toLowerCase()}@internal.app`

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })

      if (authError) {
        return { error: authError as Error }
      }

      if (authData.user) {
        await supabase
          .from('profiles')
          .update({ username })
          .eq('id', authData.user.id)

        await supabase
          .from('invitation_codes')
          .update({
            is_used: true,
            used_by: authData.user.id,
            used_at: new Date().toISOString()
          })
          .eq('code', invitationCode)
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .maybeSingle()

      if (profileError || !profileData) {
        return { error: new Error('Invalid username or password') }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      })

      if (error) {
        return { error: new Error('Invalid username or password') }
      }

      if (!rememberMe) {
        await supabase.auth.updateUser({ data: { remember_me: false } })
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
