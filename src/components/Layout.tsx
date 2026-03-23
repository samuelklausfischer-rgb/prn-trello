import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import Header from './Header'
import { useAuth } from '@/hooks/useAuthHooks'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CheckSquare, Trophy, ShieldCheck } from 'lucide-react'

export default function Layout() {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold shadow-lg"
      >
        Pular para o conteúdo principal
      </a>

      <AppSidebar />

      <SidebarInset className="bg-background flex flex-col min-h-screen pb-16 md:pb-0 transition-colors duration-300">
        <Header />

        <main
          id="main-content"
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto outline-none"
          tabIndex={-1}
        >
          <div className="max-w-[1600px] mx-auto h-full">
            <Outlet />
          </div>
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
          <Link
            to="/dashboard"
            aria-label="Ir para Dashboard"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              location.pathname === '/dashboard'
                ? 'text-primary'
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
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tarefas</span>
          </Link>
          <Link
            to="/team"
            aria-label="Ir para Ranking"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              location.pathname === '/team'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium">Ranking</span>
          </Link>
          {role === 'ADMIN' && (
            <Link
              to="/admin"
              aria-label="Ir para Painel Administrativo"
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                location.pathname.startsWith('/admin')
                  ? 'text-primary'
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
