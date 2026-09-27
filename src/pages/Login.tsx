import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trophy, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginForm = z.infer<typeof loginSchema>
type SignUpForm = z.infer<typeof signUpSchema>

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp } = useAuth()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
    },
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    try {
      const { error } = await signIn(data.email, data.password)
      if (error) {
        toast.error(error.message || 'Failed to sign in')
      } else {
        toast.success('Signed in successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpForm) => {
    setLoading(true)
    try {
      const { error } = await signUp(data.email, data.password, data.fullName)
      if (error) {
        toast.error(error.message || 'Failed to create account')
      } else {
        toast.success('Account created successfully! Please check your email for verification.')
        setIsSignUp(false)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Trophy className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">CRICKSTATS</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {!isSignUp ? (
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                {...loginForm.register('email')}
                error={loginForm.formState.errors.email?.message}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500"
                onClick={() => setIsSignUp(true)}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                {...signUpForm.register('fullName')}
                error={signUpForm.formState.errors.fullName?.message}
              />
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                {...signUpForm.register('email')}
                error={signUpForm.formState.errors.email?.message}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...signUpForm.register('password')}
                  error={signUpForm.formState.errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...signUpForm.register('confirmPassword')}
                error={signUpForm.formState.errors.confirmPassword?.message}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Sign Up
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500"
                onClick={() => setIsSignUp(false)}
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Cricket Player Performance Tracking & Analytics System
          </p>
        </div>
      </div>
    </div>
  )
}