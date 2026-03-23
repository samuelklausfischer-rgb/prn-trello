import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Trophy, Settings, Flag } from 'lucide-react'
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
import useAuthStore from '@/stores/useAuthStore'

export default function AppSidebar() {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) return null

  const navItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { title: 'Equipe & Ranking', path: '/team', icon: Trophy },
  ]

  if (user.role === 'ADMIN') {
    navItems.push({ title: 'Painel Admin', path: '/admin', icon: Settings })
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
                      className={`h-10 transition-all ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'hover:bg-secondary/20'}`}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon
                          className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span className="font-medium">{item.title}</span>
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
