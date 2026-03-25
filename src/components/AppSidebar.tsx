import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Trophy,
  ShieldCheck,
  Activity,
  Medal,
  Zap,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuthHooks'

export default function AppSidebar() {
  const { role } = useAuth()
  const location = useLocation()

  const navItems = [
    { title: 'Dashboard Pessoal', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { title: 'Equipe & Ranking', path: '/team', icon: Trophy },
    { title: 'Conquistas', path: '/achievements', icon: Medal },
  ]

  if (role === 'ADMIN') {
    navItems.push({ title: 'Dashboard Analítico', path: '/admin/dashboard', icon: Activity })
    navItems.push({ title: 'Painel Admin', path: '/admin', icon: ShieldCheck })
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 shadow-sm hidden md:flex glass-panel bg-transparent">
      <SidebarHeader className="h-16 flex items-center border-b border-border/50">
        <div className="flex items-center gap-3 px-3 w-full overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-accent rounded-lg p-1.5 shrink-0 flex items-center justify-center shadow-neon">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-tight truncate group-data-[collapsible=icon]:hidden">
            PRN Organizador
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-4 px-2">
              {navItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                return (
                  <SidebarMenuItem key={item.path} className={`animate-fade-in-up stagger-${index + 1}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 transition-all duration-300 hover-3d ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20'
                          : 'hover:bg-primary/5 text-muted-foreground'
                      }`}
                    >
                      <Link
                        to={item.path}
                        aria-label={item.title}
                        className="flex items-center gap-3"
                      >
                        <item.icon
                          className={`w-5 h-5 ${isActive ? 'text-primary drop-shadow-md' : 'text-muted-foreground'}`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

