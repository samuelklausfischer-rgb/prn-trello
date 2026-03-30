import { useEffect, useState, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import Header from './Header'
import AchievementNotifier from './AchievementNotifier'
import { useAuth } from '@/hooks/useAuthHooks'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CheckSquare, ShieldCheck, Medal } from 'lucide-react'

export default function Layout() {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width >= 768 && width <= 1024) {
        setSidebarOpen(false)
      } else if (width > 1024) {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollY(e.currentTarget.scrollTop)
  }

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AchievementNotifier />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold shadow-neon"
      >
        Pular para o conteúdo principal
      </a>

      <AppSidebar />

      <SidebarInset className="relative flex flex-col min-h-screen pb-16 md:pb-0 transition-colors duration-300 z-0 bg-transparent">
        {/* Parallax Background */}
        <div
          className="fixed inset-0 z-[-1] bg-background bg-particles pointer-events-none transition-transform duration-75 ease-out"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />

        <Header />

        <main
          ref={mainRef}
          id="main-content"
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden outline-none flex flex-col min-h-0"
          tabIndex={-1}
          onScroll={handleScroll}
        >
          <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t-white/10 flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Link
            to="/dashboard"
            aria-label="Ir para Dashboard"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              location.pathname === '/dashboard'
                ? 'text-primary drop-shadow-md'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          <Link
            to="/tasks"
            aria-label="Ir para Tarefas"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              location.pathname === '/tasks'
                ? 'text-primary drop-shadow-md'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tarefas</span>
          </Link>
          <Link
            to="/achievements"
            aria-label="Ir para Conquistas"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              location.pathname === '/achievements'
                ? 'text-accent drop-shadow-md'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Medal className="w-5 h-5" />
            <span className="text-[10px] font-medium">Conquistas</span>
          </Link>
          {role === 'ADMIN' && (
            <Link
              to="/admin"
              aria-label="Ir para Painel Administrativo"
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                location.pathname.startsWith('/admin')
                  ? 'text-amber-500 drop-shadow-md'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
