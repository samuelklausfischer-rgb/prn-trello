import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Zap, KeyRound, AlertCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { ClientResponseError } from 'pocketbase'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    if (!token) {
      setErrorMsg('Token de recuperação inválido ou ausente.')
      return
    }

    let hasErrors = false
    const newErrors: Record<string, string> = {}

    if (password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres.'
      hasErrors = true
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'As senhas não coincidem.'
      hasErrors = true
    }

    if (hasErrors) {
      setFieldErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)

      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Sua senha foi atualizada. Faça login com a nova senha.',
      })

      navigate('/auth', { replace: true })
    } catch (err: unknown) {
      let errors: Record<string, string> = {}
      let defaultMessage = 'Erro ao redefinir a senha. O link pode ter expirado ou ser inválido.'

      if (err instanceof ClientResponseError) {
        errors = extractFieldErrors(err)
        defaultMessage = err.message || defaultMessage
        if (err.status === 400 && err.response?.message === 'Invalid or expired token.') {
          defaultMessage = 'O link de recuperação é inválido ou já expirou. Solicite um novo.'
        }
      } else if (err instanceof Error) {
        defaultMessage = err.message
      }

      setFieldErrors(errors)

      if (Object.keys(errors).length === 0) {
        setErrorMsg(defaultMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-12 relative bg-background bg-particles">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-primary" />
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight">
          PRN Organizador
        </span>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in-up glass-card p-8 sm:p-10 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Nova Senha</h2>
          <p className="text-muted-foreground font-medium">
            Digite sua nova senha para acessar o sistema.
          </p>
        </div>

        {!token ? (
          <div className="space-y-6 pt-4">
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20 text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Token de recuperação inválido ou ausente. Por favor, solicite um novo link.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/auth')} className="w-full h-12">
              Voltar ao Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2.5">
                <Label htmlFor="password">Nova Senha</Label>
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
                  className={`h-12 bg-background/50 border-white/10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="passwordConfirm">Confirmar Nova Senha</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value)
                    setErrorMsg('')
                    setFieldErrors((prev) => ({ ...prev, passwordConfirm: '' }))
                  }}
                  className={`h-12 bg-background/50 border-white/10 ${fieldErrors.passwordConfirm ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-invalid={!!fieldErrors.passwordConfirm}
                />
                {fieldErrors.passwordConfirm && (
                  <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.passwordConfirm}
                  </p>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="text-sm font-semibold text-destructive animate-in fade-in slide-in-from-top-1 bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-12 text-md mt-2">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Voltar ao login
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
