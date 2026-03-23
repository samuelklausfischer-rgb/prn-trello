import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Trophy, ShieldCheck, Flag, Activity } from 'lucide-react'
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
  ]

  // Conditional rendering based on role for the navigation menu
  if (role === 'ADMIN') {
    navItems.push({ title: 'Dashboard Analítico', path: '/admin/dashboard', icon: Activity })
    navItems.push({ title: 'Painel Admin', path: '/admin', icon: ShieldCheck })
  }

  return (
    <Sidebar collapsible="icon" className="border-r shadow-sm">
      <SidebarHeader className="h-16 flex items-center border-b">
        <div className="flex items-center gap-3 px-3 w-full overflow-hidden">
          <div className="bg-primary rounded-lg p-1.5 shrink-0 flex items-center justify-center">
            <Flag className="h-5 w-5 text-accent" />
          </div>
          <span className="font-bold text-lg text-primary tracking-tight truncate group-data-[collapsible=icon]:hidden">
            PRN CRM
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-4 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-10 transition-all ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon
                          className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
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
