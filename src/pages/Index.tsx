import { Button } from '@/components/ui/button'
import { Link, Navigate } from 'react-router-dom'
import { CheckSquare, LayoutDashboard, Trophy, Activity, ArrowRight } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import PageTransition from '@/components/PageTransition'

export default function Index() {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <header className="px-6 lg:px-12 py-6 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">PRN Diagnósticos</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#funcionalidades" className="hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#metodologia" className="hover:text-primary transition-colors">
              Nossa Metodologia
            </a>
          </nav>
          <div className="flex gap-4">
            <Link to="/auth">
              <Button variant="outline" className="font-semibold">
                Entrar
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center">
          <section className="w-full max-w-6xl px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Portal Exclusivo para Colaboradores
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight">
              Gestão inteligente e <span className="text-primary">gamificada</span> para a equipe.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Organize seu checklist diário, monitore o que está em produção, execução ou concluído,
              e ganhe pontos por sua produtividade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 shadow-lg">
                  Acessar meu Dashboard <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>

          <section id="funcionalidades" className="w-full bg-muted/30 py-24 border-y">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Workflow Visual</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gerencie suas tarefas no modelo Kanban. Saiba exatamente o que fazer, o que está
                  em andamento e o que já foi entregue.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Checklists Detalhados</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quebre tarefas complexas em etapas menores. Garanta a qualidade e precisão dos
                  diagnósticos e processos internos.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Gamificação</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complete tarefas, bata prazos e suba no ranking da empresa. Transforme sua
                  produtividade em conquistas reais.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-8 text-center text-muted-foreground border-t bg-muted/10">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} PRN Diagnósticos. Sistema de Produtividade Interno.
          </p>
        </footer>
      </div>
    </PageTransition>
  )
}
