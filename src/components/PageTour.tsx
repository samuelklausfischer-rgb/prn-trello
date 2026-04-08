import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { GuideTour, type TourStep } from './GuideTour'
import useTourStore from '@/stores/useTourStore'
import useAuthStore from '@/stores/useAuthStore'

export default function PageTour() {
  const { pathname } = useLocation()
  const { isOpen, closeTour, startTour } = useTourStore()
  const { user, updateTutorialProgress } = useAuthStore()

  const normalizedPath = useMemo(() => {
    if (pathname === '/' || pathname === '/dashboard') return '/dashboard'
    if (pathname === '/ranking' || pathname === '/team') return '/team'
    if (pathname === '/admin/collaborators' || pathname === '/admin/employees')
      return '/admin/employees'
    return pathname
  }, [pathname])

  const steps = useMemo<TourStep[]>(() => {
    const defaultTarget = 'header'
    switch (normalizedPath) {
      case '/dashboard':
        return [
          {
            target: defaultTarget,
            title: 'Dashboard Pessoal',
            content:
              'Objetivo: Ter uma visão geral do seu desempenho.\n\nResumo: Aqui você acompanha suas estatísticas, tarefas recentes e progresso diário em tempo real.\n\nPasso a Passo:\n1. Verifique seus pontos totais no topo\n2. Acompanhe a barra de progresso do seu nível\n3. Veja as notificações recentes.\n\nDica: Mantenha suas tarefas sempre atualizadas para ganhar mais pontos!',
            placement: 'bottom',
          },
        ]
      case '/tasks':
        return [
          {
            target: defaultTarget,
            title: 'Quadro de Tarefas',
            content:
              'Objetivo: Gerenciar suas atividades diárias e fluxos de trabalho.\n\nResumo: Visualize, crie e mova tarefas entre as colunas do quadro Kanban.\n\nPasso a Passo:\n1. Clique em "Nova Tarefa" para adicionar\n2. Preencha os detalhes e prazos\n3. Arraste os cards para mudar o status da tarefa.\n\nDica: Tarefas concluídas antes do prazo rendem pontos extras!',
            placement: 'bottom',
          },
        ]
      case '/projects':
        return [
          {
            target: defaultTarget,
            title: 'Trabalhos e Projetos',
            content:
              'Objetivo: Acompanhar o progresso de grandes entregas da equipe.\n\nResumo: Gerencie projetos que contêm múltiplas tarefas associadas e veja o progresso geral.\n\nPasso a Passo:\n1. Adicione um novo projeto\n2. Associe tarefas a ele no quadro Kanban\n3. Monitore a barra de progresso.\n\nDica: Projetos concluídos com 100% de sucesso geram bônus para todos os envolvidos.',
            placement: 'bottom',
          },
        ]
      case '/team':
        return [
          {
            target: defaultTarget,
            title: 'Equipe e Ranking',
            content:
              'Objetivo: Visualizar o desempenho e a colocação de todos na empresa.\n\nResumo: Acompanhe a tabela de classificação gamificada e veja quem são os destaques da semana.\n\nPasso a Passo:\n1. Confira o Top 3 no pódio\n2. Verifique sua posição atual\n3. Veja quantos pontos faltam para subir no ranking.\n\nDica: Colaborar com outros membros também rende pontos de equipe!',
            placement: 'bottom',
          },
        ]
      case '/achievements':
        return [
          {
            target: defaultTarget,
            title: 'Galeria de Conquistas',
            content:
              'Objetivo: Colecionar medalhas por seus méritos e esforços contínuos.\n\nResumo: Aqui ficam todas as conquistas que você já desbloqueou e as que ainda pode alcançar.\n\nPasso a Passo:\n1. Veja suas insígnias ativas\n2. Clique nas conquistas bloqueadas para ler os requisitos.\n\nDica: Fique atento aos desafios ocultos que garantem medalhas raras!',
            placement: 'bottom',
          },
        ]
      case '/admin':
      case '/admin/dashboard':
        return [
          {
            target: defaultTarget,
            title: 'Painel Administrativo',
            content:
              'Objetivo: Gerenciar as configurações gerais e visão macro do sistema.\n\nResumo: Acesse métricas globais, atividades recentes e configurações de gamificação.\n\nPasso a Passo:\n1. Monitore a saúde geral do time\n2. Configure regras de pontuação\n3. Audite o histórico de ações.\n\nDica: Use os relatórios para identificar gargalos de produtividade.',
            placement: 'bottom',
          },
        ]
      case '/admin/employees':
        return [
          {
            target: defaultTarget,
            title: 'Gestão de Colaboradores',
            content:
              'Objetivo: Administrar as contas e pontos dos usuários do sistema.\n\nResumo: Adicione, edite ou remova acessos da sua equipe. Você também pode atribuir pontos manuais.\n\nPasso a Passo:\n1. Liste todos os colaboradores\n2. Edite cargos e departamentos\n3. Use a opção de bonificação manual quando necessário.\n\nDica: Mantenha os cadastros atualizados para relatórios precisos.',
            placement: 'bottom',
          },
        ]
      case '/profile':
        return [
          {
            target: defaultTarget,
            title: 'Meu Perfil',
            content:
              'Objetivo: Personalizar sua conta e visualizar seu histórico.\n\nResumo: Altere seu avatar, informações de contato e veja seu histórico de atividades detalhado.\n\nPasso a Passo:\n1. Atualize sua foto de perfil\n2. Edite sua biografia\n3. Revise as últimas ações na sua conta.\n\nDica: Perfis completos geram mais confiança na equipe.',
            placement: 'bottom',
          },
        ]
      default:
        return [
          {
            target: defaultTarget,
            title: 'Como Funciona',
            content:
              'Navegue pelo sistema usando o menu lateral e o cabeçalho superior para descobrir mais funcionalidades e gerenciar sua produtividade de forma gamificada.',
            placement: 'bottom',
          },
        ]
    }
  }, [normalizedPath])

  const tourId = `tour_${normalizedPath.replace(/[^a-zA-Z0-9]/g, '_')}`

  useEffect(() => {
    if (!user || !steps.length) return
    const hasSeen = user.tutorial_progress?.[tourId]

    if (!hasSeen) {
      const timer = setTimeout(() => {
        startTour()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [normalizedPath, user, tourId, startTour, steps.length])

  const handleClose = () => {
    closeTour()
    if (user && updateTutorialProgress) {
      updateTutorialProgress(tourId, true)
    }
  }

  return <GuideTour open={isOpen} onClose={handleClose} steps={steps} />
}
