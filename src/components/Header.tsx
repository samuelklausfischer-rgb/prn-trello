import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Trophy, LogOut, User as UserIcon, ShieldCheck, Moon, Sun } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuthHooks'
import { useTheme } from './ThemeProvider'

export default function Header() {
  const { user, logout, role } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [animProgress, setAnimProgress] = useState(0)

  useEffect(() => {
    if (user) {
      const target = ((user.points % 500) / 500) * 100
      const timer = setTimeout(() => setAnimProgress(target), 200)
      return () => clearTimeout(timer)
    }
  }, [user?.points])

  if (!user) return null

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard'
      case '/tasks':
        return 'Gestão de Tarefas'
      case '/team':
        return 'Equipe & Ranking'
      case '/admin':
        return 'Painel Admin'
      case '/admin/dashboard':
        return 'Dashboard Analítico'
      default:
        return 'Página'
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const isAdmin = role === 'ADMIN'

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-subtle transition-colors">
      <div className="flex items-center gap-4">
        <SidebarTrigger aria-label="Alternar Menu Lateral" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-muted-foreground hover:text-primary">
                <Link to="/">PRN</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{getBreadcrumb()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex flex-col items-end justify-center">
          <p className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            Nível {user.level}{' '}
            <span className="font-normal text-muted-foreground ml-1">({user.points} pts)</span>
          </p>
          <Progress
            aria-label="Progresso de nível"
            value={animProgress}
            className="h-1.5 w-28 mt-1.5 bg-primary/10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Alternar modo escuro"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full shadow-sm bg-background hidden sm:flex"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </Button>

          {isAdmin && (
            <Badge
              variant="default"
              className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-white gap-1 px-2.5 shadow-sm"
            >
              <ShieldCheck className="w-3 h-3" /> ADMIN
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu de usuário"
                className="flex items-center gap-2 outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring transition-transform hover:scale-105 active:scale-95"
              >
                <Avatar
                  className={`h-9 w-9 shadow-sm ${
                    isAdmin
                      ? 'border-2 border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-2 border-primary/20'
                  }`}
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback
                    className={`${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'} font-bold`}
                  >
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-sans">
              <div className="px-2 py-2.5 border-b mb-1">
                <p className="font-bold text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {isAdmin && (
                  <Badge className="mt-2 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-0 px-1.5 py-0">
                    Admin Privileges
                  </Badge>
                )}
              </div>

              <DropdownMenuItem className="flex sm:hidden flex-col items-start gap-1 py-3 border-b mb-1">
                <span className="font-semibold text-sm">Nível {user.level}</span>
                <span className="text-xs text-muted-foreground">{user.points} pts totais</span>
                <Progress value={animProgress} className="h-1.5 w-full mt-1.5" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer py-2 sm:hidden"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" /> Modo Claro
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" /> Modo Escuro
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer py-2">
                <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" /> Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer py-2"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sair do Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
