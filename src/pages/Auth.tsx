import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuthHooks'
import { Trophy, Loader2, Target, Users, LayoutDashboard } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'register') {
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
          name,
        })
        await pb.collection('users').authWithPassword(email, password)
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Bem-vindo(a) ao PRN CRM.',
        })
      } else {
        await pb.collection('users').authWithPassword(email, password)
        toast({
          title: 'Login bem-sucedido!',
          description: 'Bem-vindo(a) de volta ao sistema.',
        })
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro na autenticação. Verifique os dados fornecidos.')
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Não foi possível concluir a operação.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoFill = (type: 'admin' | 'employee') => {
    setMode('login')
    if (type === 'admin') {
      setEmail('paulonovack@gmail.com')
      setPassword('securepassword123')
    } else {
      setEmail('joao@prn.com')
      setPassword('func123')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Column - Branding & Info */}
      <div className="hidden md:flex flex-col flex-1 bg-primary text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/40 via-primary to-primary -z-10"></div>

        <div className="flex items-center gap-3 z-10 animate-fade-in-up">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight tracking-tighter">PRN CRM</span>
        </div>

        <div
          className="flex-1 flex flex-col justify-center max-w-xl space-y-8 z-10 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
            Gestão inteligente e <span className="text-accent">gamificada</span> para equipes.
          </h1>
          <p className="text-lg text-primary-foreground/80 font-medium max-w-lg leading-relaxed">
            Acompanhe tarefas, alcance metas e lidere o ranking da empresa em um único ambiente
            integrado.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 bg-black/10 w-fit px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
              <LayoutDashboard className="w-5 h-5 text-accent" />
              <span className="font-semibold text-sm">Painéis Personalizados por Perfil</span>
            </div>
            <div className="flex items-center gap-3 bg-black/10 w-fit px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
              <Target className="w-5 h-5 text-accent" />
              <span className="font-semibold text-sm">Metas e Pontuações Dinâmicas</span>
            </div>
            <div className="flex items-center gap-3 bg-black/10 w-fit px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
              <Users className="w-5 h-5 text-accent" />
              <span className="font-semibold text-sm">Ranking de Equipe em Tempo Real</span>
            </div>
          </div>
        </div>

        <div className="mt-auto text-primary-foreground/60 text-sm font-medium z-10 animate-fade-in">
          &copy; {new Date().getFullYear()} PRN Systems. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Column - Login / Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary tracking-tight">PRN CRM</span>
        </div>

        <div
          className="w-full max-w-md space-y-8 animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {mode === 'login'
                ? 'Insira suas credenciais para continuar.'
                : 'Preencha os dados para se registrar.'}
            </p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as 'login' | 'register')
              setErrorMsg('')
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2.5">
                  <Label htmlFor="name">Nome Completo (Opcional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="João Silva"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrorMsg('')
                    }}
                    className="h-12"
                  />
                </div>
              )}
              <div className="space-y-2.5">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@prn.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrorMsg('')
                  }}
                  className={`h-12 ${errorMsg ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === 'login' && (
                    <a
                      href="#"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrorMsg('')
                  }}
                  className={`h-12 ${errorMsg ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-sm font-semibold text-destructive animate-in fade-in slide-in-from-top-1">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-md font-bold transition-all active:scale-[0.98] shadow-md group relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === 'login' ? 'Autenticando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <span className="relative z-10">
                    {mode === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                </>
              )}
            </Button>
          </form>

          {/* Quick Login Links for Demo Purposes */}
          <div className="pt-6 border-t border-border space-y-4">
            <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider">
              Acesso Rápido (Demonstração)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                className="h-auto py-3 px-4 flex flex-col items-start gap-1"
                onClick={() => handleDemoFill('admin')}
              >
                <span className="text-xs font-bold text-amber-600">Admin</span>
                <span className="text-[10px] text-muted-foreground">paulonovack...</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-auto py-3 px-4 flex flex-col items-start gap-1"
                onClick={() => handleDemoFill('employee')}
              >
                <span className="text-xs font-bold text-primary">Funcionário</span>
                <span className="text-[10px] text-muted-foreground">joao@prn.com</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
