import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Trophy, LogOut, User as UserIcon } from 'lucide-react'
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
import useAuthStore from '@/stores/useAuthStore'

export default function Header() {
  const { user, logout } = useAuthStore()
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
        return 'Dashboard'
      case '/tasks':
        return 'Gestão de Tarefas'
      case '/team':
        return 'Equipe & Ranking'
      case '/admin':
        return 'Painel Admin'
      default:
        return 'Página'
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-subtle">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
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
          <Progress value={animProgress} className="h-1.5 w-28 mt-1.5 bg-primary/10" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring transition-transform hover:scale-105 active:scale-95">
              <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-sans">
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 sm:hidden border-b mb-1">
              <span className="font-semibold text-sm">Nível {user.level}</span>
              <span className="text-xs text-muted-foreground">{user.points} pts totais</span>
              <Progress value={animProgress} className="h-1.5 w-full mt-1.5" />
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
    </header>
  )
}
