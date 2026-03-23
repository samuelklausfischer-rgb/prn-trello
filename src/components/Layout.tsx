import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import Header from './Header'
import { useAuth } from '@/hooks/useAuthHooks'

export default function Layout() {
  const { isAuthenticated } = useAuth()

  // Avoid rendering layout elements if not authenticated
  // (though ProtectedRoute should prevent reaching here)
  if (!isAuthenticated) {
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
