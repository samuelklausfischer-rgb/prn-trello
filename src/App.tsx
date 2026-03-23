import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Tasks from './pages/Tasks'
import Team from './pages/Team'
import Admin from './pages/Admin'
import { AppProviders } from './stores/providers'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => (
  <AppProviders>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<Team />} />

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProviders>
)

export default App
