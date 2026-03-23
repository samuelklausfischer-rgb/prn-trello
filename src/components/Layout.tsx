import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import Header from './Header'

export default function Layout() {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />
  }

  if (!user) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
