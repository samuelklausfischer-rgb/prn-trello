import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/hooks/useAuthHooks'
import { Loader2, Target, Users, LayoutDashboard, Zap, ArrowLeft, MailCheck } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { ClientResponseError } from 'pocketbase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'employee' | 'admin'>('employee')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login')
  const [resetSent, setResetSent] = useState(false)

  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const defaultRedirect = mode === 'register' ? '/tasks' : '/'
  const from = (location.state as any)?.from?.pathname || defaultRedirect

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    if (mode === 'forgot-password') {
      if (!email || !isValidEmail(email)) {
        setErrorMsg('Por favor, insira um e-mail válido.')
        return
      }
      setIsLoading(true)
      try {
        await pb.collection('users').requestPasswordReset(email)
        setResetSent(true)
      } catch (err: unknown) {
        // Even if it fails, for security we often just say "if it exists we sent an email",
        // but let's show actual errors if they are helpful (e.g., validation)
        if (err instanceof ClientResponseError && err.status === 400) {
          setErrorMsg('Não foi possível processar a solicitação. Verifique o e-mail.')
        } else {
          setResetSent(true) // Generic success to prevent email enumeration
        }
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (mode === 'register') {
      if (!name || !email || !password || !passwordConfirm) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.')
        return
      }
      if (password !== passwordConfirm) {
        setErrorMsg('As senhas não coincidem.')
        return
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.')
        return
      }
    }

    setIsLoading(true)

    try {
      if (mode === 'register') {
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm,
          name,
          role,
        })
        await pb.collection('users').authWithPassword(email, password)
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Bem-vindo(a) ao PRN Organizador.',
        })
      } else {
        await pb.collection('users').authWithPassword(email, password)
        toast({
          title: 'Login bem-sucedido!',
          description: 'Bem-vindo(a) de volta ao sistema.',
        })
      }
    } catch (err: unknown) {
      let errors: Record<string, string> = {}
      let defaultMessage = 'Erro na autenticação. Verifique os dados fornecidos.'

      if (err instanceof ClientResponseError) {
        errors = extractFieldErrors(err)
        const emailError = err.response?.data?.email

        if (mode === 'register' && err.status === 400) {
          if (
            emailError?.code === 'validation_not_unique' ||
            emailError?.code === 'validation_invalid_email' ||
            (errors.email && errors.email.match(/already in use/i))
          ) {
            errors.email = 'Este e-mail já está cadastrado'
          }
        }
        defaultMessage = err.message || defaultMessage
      } else if (err instanceof Error) {
        defaultMessage = err.message
      }

      setFieldErrors(errors)

      if (Object.keys(errors).length === 0) {
        setErrorMsg(defaultMessage)
      }

      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Não foi possível concluir a operação. Verifique os dados e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex flex-col flex-1 bg-slate-950 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/40 via-primary/20 to-slate-950 -z-10 bg-particles"></div>

        <div className="flex items-center gap-3 z-10 animate-fade-in-up stagger-1">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-neon">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            PRN Organizador
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-xl space-y-8 z-10 animate-fade-in-up stagger-2">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
            Gestão inteligente e{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              gamificada
            </span>{' '}
            para equipes.
          </h1>
          <p className="text-lg text-white/80 font-medium max-w-lg leading-relaxed">
            Acompanhe tarefas, alcance metas e lidere o ranking da empresa em um único ambiente
            integrado.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-full w-fit hover-3d">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Painéis Personalizados por Perfil</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-full w-fit hover-3d">
              <Target className="w-5 h-5 text-accent" />
              <span className="font-semibold text-sm">Metas e Pontuações Dinâmicas</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-full w-fit hover-3d">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Ranking de Equipe em Tempo Real</span>
            </div>
          </div>
        </div>

        <div className="mt-auto text-white/50 text-sm font-medium z-10 animate-fade-in stagger-3">
          &copy; {new Date().getFullYear()} PRN Systems. Todos os direitos reservados.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-particles">
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight">
            PRN Organizador
          </span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-fade-in-up stagger-2 glass-card p-8 sm:p-10 rounded-3xl border-t border-l border-white/20">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {mode === 'login'
                ? 'Acesse sua conta'
                : mode === 'register'
                  ? 'Crie sua conta'
                  : 'Recuperar senha'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {mode === 'login'
                ? 'Insira suas credenciais para continuar.'
                : mode === 'register'
                  ? 'Preencha os dados para registrar sua nova conta.'
                  : 'Informe seu e-mail para receber um link de recuperação.'}
            </p>
          </div>

          {mode !== 'forgot-password' && (
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as 'login' | 'register')
                setErrorMsg('')
                setFieldErrors({})
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
                <TabsTrigger value="login" className="rounded-md">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-md">
                  Cadastrar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {mode === 'forgot-password' && resetSent ? (
            <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300 py-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <MailCheck className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">E-mail enviado</h3>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  Se existir uma conta associada a este e-mail, você receberá um link para redefinir
                  sua senha em instantes.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setMode('login')
                  setResetSent(false)
                  setPassword('')
                }}
                className="w-full h-12"
              >
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div className="space-y-3">
                      <Label>Tipo de Conta</Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(val) => setRole(val as 'employee' | 'admin')}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <Label
                            htmlFor="role-employee"
                            className={`flex items-center justify-center rounded-xl border p-3.5 cursor-pointer transition-all ${
                              role === 'employee'
                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                : 'border-white/10 bg-background/50 hover:bg-background/80 text-muted-foreground'
                            }`}
                          >
                            <RadioGroupItem
                              value="employee"
                              id="role-employee"
                              className="sr-only"
                            />
                            <span className="font-semibold">Funcionário</span>
                          </Label>
                        </div>
                        <div>
                          <Label
                            htmlFor="role-admin"
                            className={`flex items-center justify-center rounded-xl border p-3.5 cursor-pointer transition-all ${
                              role === 'admin'
                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                : 'border-white/10 bg-background/50 hover:bg-background/80 text-muted-foreground'
                            }`}
                          >
                            <RadioGroupItem value="admin" id="role-admin" className="sr-only" />
                            <span className="font-semibold">Administrador</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="João Silva"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          setErrorMsg('')
                          setFieldErrors((prev) => ({ ...prev, name: '' }))
                        }}
                        className={`h-12 bg-background/50 border-white/10 ${fieldErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        aria-invalid={!!fieldErrors.name}
                      />
                      {fieldErrors.name && (
                        <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>
                  </>
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
                      setFieldErrors((prev) => ({ ...prev, email: '' }))
                    }}
                    className={`h-12 bg-background/50 border-white/10 ${errorMsg || fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!fieldErrors.email}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {mode !== 'forgot-password' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-primary hover:text-accent transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            setMode('forgot-password')
                            setErrorMsg('')
                            setFieldErrors({})
                          }}
                        >
                          Esqueceu a senha?
                        </button>
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
                        setFieldErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      className={`h-12 bg-background/50 border-white/10 ${errorMsg || fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-invalid={!!fieldErrors.password}
                    />
                    {fieldErrors.password && (
                      <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                )}

                {mode === 'register' && (
                  <div className="space-y-2.5">
                    <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      placeholder="••••••••"
                      value={passwordConfirm}
                      onChange={(e) => {
                        setPasswordConfirm(e.target.value)
                        setErrorMsg('')
                      }}
                      className={`h-12 bg-background/50 border-white/10 ${errorMsg.includes('senhas não coincidem') ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="text-sm font-semibold text-destructive animate-in fade-in slide-in-from-top-1 bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button type="submit" disabled={isLoading} className="w-full h-12 text-md">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {mode === 'login'
                        ? 'Autenticando...'
                        : mode === 'register'
                          ? 'Registrando...'
                          : 'Enviando...'}
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">
                        {mode === 'login'
                          ? 'Entrar no Sistema'
                          : mode === 'register'
                            ? 'Criar Conta'
                            : 'Enviar Link de Recuperação'}
                      </span>
                    </>
                  )}
                </Button>

                {mode === 'forgot-password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setMode('login')
                      setErrorMsg('')
                    }}
                    className="w-full h-12 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Login
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
