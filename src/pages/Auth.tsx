import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import { Trophy } from 'lucide-react'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, login } = useAuthStore()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login(email)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10"></div>

      <Card className="w-full max-w-md shadow-elevation border-primary/10 animate-fade-in-up bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-5 pb-8 pt-10">
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
            <Trophy className="w-10 h-10 text-accent animate-float" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-primary tracking-tight">
              PRN CRM
            </CardTitle>
            <CardDescription className="text-base">Acesse sua conta para continuar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background"
                required
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full text-md h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all active:scale-[0.98] shadow-md mt-2"
            >
              Entrar no Sistema
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Use <span className="font-medium text-foreground">admin@prn.com</span> para acesso
            Administrativo.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
