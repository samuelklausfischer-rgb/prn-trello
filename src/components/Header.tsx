import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Trophy,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Moon,
  Sun,
  Bell,
  Activity,
  Info,
  AlertTriangle,
  CheckCheck,
  TrendingUp,
  UserPlus,
  Star,
} from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuthHooks'
import { useTheme } from './ThemeProvider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export default function Header() {
  const { user, logout, role } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [animProgress, setAnimProgress] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const target = (((user.xp || 0) % 500) / 500) * 100
      const timer = setTimeout(() => setAnimProgress(target), 200)
      return () => clearTimeout(timer)
    }
  }, [user?.xp])

  const loadNotifications = async () => {
    if (!user) return
    try {
      const data = await getNotifications(user.id)
      setNotifications(data)
    } catch (e) {
      console.error('Failed to load notifications', e)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  useRealtime('notifications', (e) => {
    if (e.record && e.record.user === user?.id) {
      loadNotifications()
    }
  })

  if (!user) return null

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard'
      case '/tasks':
        return 'Quadro de Tarefas'
      case '/team':
        return 'Equipe & Ranking'
      case '/achievements':
        return 'Conquistas'
      case '/profile':
        return 'Meu Perfil'
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

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id)
      loadNotifications()
    }
    if (notif.action_url) {
      setPopoverOpen(false)
      if (notif.action_url.startsWith('http')) {
        window.open(notif.action_url, '_blank')
      } else {
        navigate(notif.action_url)
      }
    }
  }

  const handleMarkAll = async () => {
    if (!user) return
    await markAllNotificationsAsRead(user.id)
    loadNotifications()
  }

  const isAdmin = role === 'ADMIN'

  const unreadAlerts = notifications.filter((n) => !n.is_read)

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'task_deadline':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'achievement':
        return <Trophy className="w-4 h-4 text-accent" />
      case 'level_up':
        return <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      case 'delegation':
        return <UserPlus className="w-4 h-4 text-blue-400" />
      case 'performance':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'bottleneck':
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      case 'system':
      case 'custom':
      default:
        return <Info className="w-4 h-4 text-primary" />
    }
  }

  return (
    <header className="h-16 border-b border-border/30 glass-panel flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-4 stagger-item stagger-1">
        <SidebarTrigger aria-label="Alternar Menu Lateral" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-muted-foreground hover:text-primary transition-colors font-bold"
              >
                <Link to="/">PRN</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-extrabold text-foreground tracking-tight">
                {getBreadcrumb()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-5 stagger-item stagger-2">
        <div className="hidden sm:flex flex-col items-end justify-center">
          <p className="text-xs font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-1.5 drop-shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-accent drop-shadow-sm" />
            Nível {user.level}{' '}
            <span className="font-semibold text-muted-foreground ml-1">({user.points} pts)</span>
          </p>
          <Progress
            aria-label="Progresso de nível"
            value={animProgress}
            className="h-1.5 w-28 mt-1.5"
          />
        </div>

        <div className="flex items-center gap-3">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover-3d glass-card border-transparent bg-background/50 hover:bg-white/20 dark:hover:bg-white/5"
              >
                <Bell className="w-5 h-5 text-foreground/80" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-background shadow-[0_0_8px_rgba(161,0,255,0.8)] animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 overflow-hidden glass-card border-white/20 rounded-2xl"
            >
              <div className="bg-background/60 backdrop-blur-md p-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">Notificações</h4>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-primary/20 text-primary font-bold border-0"
                  >
                    {unreadAlerts.length} não lidas
                  </Badge>
                </div>
                {unreadAlerts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover-3d"
                    onClick={handleMarkAll}
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-medium text-muted-foreground">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {notifications.map((alert) => {
                      const isUnread = !alert.is_read
                      return (
                        <div
                          key={alert.id}
                          className={cn(
                            'p-3 transition-colors hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer flex gap-3',
                            isUnread && 'bg-primary/5',
                          )}
                          onClick={() => handleNotificationClick(alert)}
                        >
                          <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <p
                                className={cn(
                                  'text-sm',
                                  isUnread
                                    ? 'font-bold text-foreground'
                                    : 'font-medium text-foreground/80',
                                )}
                              >
                                {alert.title}
                              </p>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_5px_rgba(161,0,255,0.8)] flex-shrink-0 mt-1.5"></span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {alert.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 font-semibold">
                              {formatDistanceToNow(parseISO(alert.created), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            aria-label="Alternar modo escuro"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full shadow-sm glass-card border-transparent bg-background/50 hover-3d hidden sm:flex"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500 drop-shadow-md" />
            ) : (
              <Moon className="w-4 h-4 text-primary drop-shadow-md" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu de usuário"
                className="flex items-center gap-2 outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring transition-transform hover:scale-105 active:scale-95 hover-3d shadow-sm"
              >
                <Avatar
                  className={`h-9 w-9 border-2 ${
                    isAdmin
                      ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'border-primary/50 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                  }`}
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback
                    className={`${isAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-gradient-to-br from-primary to-accent text-white'} font-bold`}
                  >
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 font-sans glass-card border-white/20 rounded-2xl p-1"
            >
              <div className="px-3 py-3 border-b border-border/50 mb-1 bg-background/50 rounded-t-xl">
                <p className="font-extrabold text-sm text-foreground truncate">{user.name}</p>
                {user.job_title && (
                  <p className="text-xs font-semibold text-primary truncate">{user.job_title}</p>
                )}
                <p className="text-xs font-medium text-muted-foreground truncate">{user.email}</p>
              </div>

              <DropdownMenuItem className="flex sm:hidden flex-col items-start gap-1 py-3 border-b border-border/50 mb-1">
                <span className="font-bold text-sm text-foreground">Nível {user.level}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {user.points} pts totais
                </span>
                <Progress value={animProgress} className="h-1.5 w-full mt-1.5" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer py-2.5 sm:hidden font-medium rounded-lg hover:bg-white/10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 mr-2 text-amber-500" /> Modo Claro
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2 text-primary" /> Modo Escuro
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-lg hover:bg-white/10">
                <Link
                  to="/profile"
                  className="cursor-pointer py-2.5 w-full font-medium flex items-center"
                >
                  <UserIcon className="w-4 h-4 mr-2 text-primary" /> Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer py-2.5 font-bold rounded-lg hover:bg-destructive/10"
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
