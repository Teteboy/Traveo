import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProviderAuthStore } from '@/stores/providerAuthStore'
import { Loader2, Building2, Lock, Mail } from 'lucide-react'

export function ProviderLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { providerLogin } = useProviderAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await providerLogin(email, password)
      if (success) {
        navigate('/provider')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#44DBD4]/10 via-white to-[#FC960E]/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-[#44DBD4] rounded-2xl flex items-center justify-center">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Provider Portal</CardTitle>
          <CardDescription>
            Sign in to manage your services and bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

             <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600">
               <p className="font-medium mb-2">Demo Credentials:</p>
               <p>Email: provider@traveo.cm</p>
               <p>Password: provider123</p>
             </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[#44DBD4] hover:underline"
            >
              ← Back to main site
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
