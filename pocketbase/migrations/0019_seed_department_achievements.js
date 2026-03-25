migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('achievements')
    const catField = col.fields.getByName('category')
    if (catField) {
      const existing = catField.values || []
      const newVals = ['licitacao', 'digitadora', 'financas', 'engenharia_ia', 'comercial']
      const combined = Array.from(new Set([...existing, ...newVals]))
      catField.values = combined
      app.save(col)
    }

    const achievementsData = [
      // Licitação (4 Common, 3 Uncommon, 2 Rare, 1 Epic)
      {
        name: 'Olho de Lince',
        slug: 'licitacao-olho-de-lince',
        description: 'Encontrou o edital perfeito no primeiro café.',
        category: 'licitacao',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Eye',
      },
      {
        name: 'Papelada em Dia',
        slug: 'licitacao-papelada-em-dia',
        description: 'Documentação organizada antes do prazo final.',
        category: 'licitacao',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'FileCheck',
      },
      {
        name: 'Mestre do PDF',
        slug: 'licitacao-mestre-do-pdf',
        description: 'Uniu 50 arquivos sem travar o computador.',
        category: 'licitacao',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'FileText',
      },
      {
        name: 'Lance Inicial',
        slug: 'licitacao-lance-inicial',
        description: 'Enviou a primeira proposta do dia com sucesso.',
        category: 'licitacao',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Send',
      },
      {
        name: 'Vencedor de Pregão',
        slug: 'licitacao-vencedor-de-pregao',
        description: 'Garantiu a vitória em uma disputa acirrada.',
        category: 'licitacao',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Trophy',
      },
      {
        name: 'Caçador de Oportunidades',
        slug: 'licitacao-cacador-de-oportunidades',
        description: 'Mapeou 10 editais novos em uma semana.',
        category: 'licitacao',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Target',
      },
      {
        name: 'Zero Erros',
        slug: 'licitacao-zero-erros',
        description: 'Passou pela fase de habilitação sem nenhuma ressalva.',
        category: 'licitacao',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'ShieldCheck',
      },
      {
        name: 'Tubarão do Governo',
        slug: 'licitacao-tubarao-do-governo',
        description: 'Fechou um contrato de grande porte para o escritório.',
        category: 'licitacao',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'Briefcase',
      },
      {
        name: 'Estrategista de Atas',
        slug: 'licitacao-estrategista-de-atas',
        description: 'Renovou 5 atas de registro de preços simultâneas.',
        category: 'licitacao',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'Layers',
      },
      {
        name: 'Lenda das Licitações',
        slug: 'licitacao-lenda-das-licitacoes',
        description: 'Alcançou a meta anual de faturamento em editais.',
        category: 'licitacao',
        rarity: 'epic',
        xp: 100,
        pts: 75,
        icon: 'Crown',
      },

      // Digitadora
      {
        name: 'Teclado Veloz',
        slug: 'digitadora-teclado-veloz',
        description: 'Digitou 10 documentos sem olhar para as mãos.',
        category: 'digitadora',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Keyboard',
      },
      {
        name: 'Formatação Perfeita',
        slug: 'digitadora-formatacao-perfeita',
        description: 'Deixou o layout impecável seguindo as normas ABNT.',
        category: 'digitadora',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'AlignLeft',
      },
      {
        name: 'Foco Total',
        slug: 'digitadora-foco-total',
        description: 'Completou uma lista de tarefas sem distrações.',
        category: 'digitadora',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Crosshair',
      },
      {
        name: 'Salvo com Sucesso',
        slug: 'digitadora-salvo-com-sucesso',
        description: 'Não perdeu nenhum arquivo por falta de backup hoje.',
        category: 'digitadora',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Save',
      },
      {
        name: 'Maratona de Dados',
        slug: 'digitadora-maratona-de-dados',
        description: 'Inseriu 500 registros no sistema em tempo recorde.',
        category: 'digitadora',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Database',
      },
      {
        name: 'Corretor Humano',
        slug: 'digitadora-corretor-humano',
        description: 'Identificou e corrigiu 5 erros no texto original.',
        category: 'digitadora',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Edit3',
      },
      {
        name: 'Organização Suprema',
        slug: 'digitadora-organizacao-suprema',
        description: 'Arquivou digitalmente 100 processos antigos.',
        category: 'digitadora',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Archive',
      },
      {
        name: 'Maestro do Office',
        slug: 'digitadora-maestro-do-office',
        description: 'Criou uma macro que automatizou 2 horas de trabalho.',
        category: 'digitadora',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'Command',
      },
      {
        name: 'Digitador de Elite',
        slug: 'digitadora-digitador-de-elite',
        description: 'Manteve o Kanban limpo por 5 dias consecutivos.',
        category: 'digitadora',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'CheckSquare',
      },
      {
        name: 'O Oráculo dos Documentos',
        slug: 'digitadora-oraculo-dos-documentos',
        description: 'Digitalizou todo o arquivo morto do semestre.',
        category: 'digitadora',
        rarity: 'epic',
        xp: 100,
        pts: 75,
        icon: 'Library',
      },

      // Finanças
      {
        name: 'Centavo a Centavo',
        slug: 'financas-centavo-a-centavo',
        description: 'Conciliou a primeira conta bancária do dia.',
        category: 'financas',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Coins',
      },
      {
        name: 'Planilha Colorida',
        slug: 'financas-planilha-colorida',
        description: 'Deixou o fluxo de caixa visualmente compreensível.',
        category: 'financas',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Table',
      },
      {
        name: 'Boleto Pago',
        slug: 'financas-boleto-pago',
        description: 'Efetuou todos os pagamentos da manhã sem atrasos.',
        category: 'financas',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Receipt',
      },
      {
        name: 'Nota Fiscal Ágil',
        slug: 'financas-nota-fiscal-agil',
        description: 'Emitiu 5 notas fiscais em menos de 10 minutos.',
        category: 'financas',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'FileCheck2',
      },
      {
        name: 'Guardião do Bradesco',
        slug: 'financas-guardiao-do-bradesco',
        description: 'Resolveu uma pendência bancária complexa por telefone.',
        category: 'financas',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'PhoneCall',
      },
      {
        name: 'Zero Glosa',
        slug: 'financas-zero-glosa',
        description: 'Faturamento aceito integralmente pelo cliente.',
        category: 'financas',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'ThumbsUp',
      },
      {
        name: 'Caçador de Descontos',
        slug: 'financas-cacador-de-descontos',
        description: 'Negociou uma redução de 10% com um fornecedor.',
        category: 'financas',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Percent',
      },
      {
        name: 'Alquimista do Lucro',
        slug: 'financas-alquimista-do-lucro',
        description: 'Apresentou um relatório que economizou 5% do orçamento.',
        category: 'financas',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'TrendingUp',
      },
      {
        name: 'Auditor Implacável',
        slug: 'financas-auditor-implacavel',
        description: 'Encontrou um erro de cobrança que ninguém viu.',
        category: 'financas',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'Search',
      },
      {
        name: 'Mestre das Finanças',
        slug: 'financas-mestre-das-financas',
        description: 'Fechamento mensal concluído com 100% de precisão.',
        category: 'financas',
        rarity: 'epic',
        xp: 100,
        pts: 75,
        icon: 'Landmark',
      },

      // Engenheiro de IA
      {
        name: 'Prompt Mágico',
        slug: 'ia-prompt-magico',
        description: 'Gerou o código perfeito na primeira tentativa.',
        category: 'engenharia_ia',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Wand2',
      },
      {
        name: 'Treinador de Modelos',
        slug: 'ia-treinador-de-modelos',
        description: 'Ajustou os parâmetros e reduziu a latência da API.',
        category: 'engenharia_ia',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Activity',
      },
      {
        name: 'Bug Hunter',
        slug: 'ia-bug-hunter',
        description: 'Encontrou e corrigiu um erro de lógica no backend.',
        category: 'engenharia_ia',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Bug',
      },
      {
        name: 'Documentação Viva',
        slug: 'ia-documentacao-viva',
        description: 'Escreveu um README que até um comercial entende.',
        category: 'engenharia_ia',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'BookOpen',
      },
      {
        name: 'Arquiteto de Dados',
        slug: 'ia-arquiteto-de-dados',
        description: 'Estruturou o banco de dados para suportar 1 milhão de linhas.',
        category: 'engenharia_ia',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Server',
      },
      {
        name: 'Integração Perfeita',
        slug: 'ia-integracao-perfeita',
        description: 'Conectou o PocketBase ao sistema legado sem quedas.',
        category: 'engenharia_ia',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Link',
      },
      {
        name: 'Automação Suprema',
        slug: 'ia-automacao-suprema',
        description: 'Criou um hook que economiza 1 hora da equipe por dia.',
        category: 'engenharia_ia',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'Bot',
      },
      {
        name: 'Visão Computacional',
        slug: 'ia-visao-computacional',
        description: 'Implementou um sistema de leitura de PDFs via IA.',
        category: 'engenharia_ia',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'ScanFace',
      },
      {
        name: 'Otimizador de Código',
        slug: 'ia-otimizador-de-codigo',
        description: 'Reduziu o tempo de resposta do servidor pela metade.',
        category: 'engenharia_ia',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'Zap',
      },
      {
        name: 'Deus da Máquina',
        slug: 'ia-deus-da-maquina',
        description: 'Criou um modelo de IA que zerou o trabalho manual do departamento.',
        category: 'engenharia_ia',
        rarity: 'epic',
        xp: 100,
        pts: 75,
        icon: 'Cpu',
      },

      // Comercial
      {
        name: 'Primeiro Contato',
        slug: 'comercial-primeiro-contato',
        description: 'Fez a primeira ligação fria do dia com sucesso.',
        category: 'comercial',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Phone',
      },
      {
        name: 'Follow-up Preciso',
        slug: 'comercial-follow-up-preciso',
        description: 'Retornou o contato com o cliente no momento exato.',
        category: 'comercial',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Clock',
      },
      {
        name: 'Quebra-Gelo',
        slug: 'comercial-quebra-gelo',
        description: 'Fez um cliente rir durante a apresentação do serviço.',
        category: 'comercial',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Smile',
      },
      {
        name: 'E-mail Persuasivo',
        slug: 'comercial-email-persuasivo',
        description: 'Recebeu resposta positiva em um cold e-mail.',
        category: 'comercial',
        rarity: 'common',
        xp: 10,
        pts: 5,
        icon: 'Mail',
      },
      {
        name: 'Negociador Nato',
        slug: 'comercial-negociador-nato',
        description: 'Contornou uma objeção difícil sobre o preço.',
        category: 'comercial',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'MessageCircle',
      },
      {
        name: 'Máquina de Reuniões',
        slug: 'comercial-maquina-de-reunioes',
        description: 'Agendou 5 reuniões qualificadas na mesma semana.',
        category: 'comercial',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'CalendarDays',
      },
      {
        name: 'Fechamento Rápido',
        slug: 'comercial-fechamento-rapido',
        description: 'Assinou o contrato na primeira reunião.',
        category: 'comercial',
        rarity: 'uncommon',
        xp: 25,
        pts: 15,
        icon: 'PenTool',
      },
      {
        name: 'Vendedor Consultivo',
        slug: 'comercial-vendedor-consultivo',
        description: 'Fez um upsell para um cliente que só queria o básico.',
        category: 'comercial',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'UserPlus',
      },
      {
        name: 'Meta Batida',
        slug: 'comercial-meta-batida',
        description: 'Alcançou a cota de vendas antes do dia 20.',
        category: 'comercial',
        rarity: 'rare',
        xp: 50,
        pts: 30,
        icon: 'BarChart',
      },
      {
        name: 'Lobo de Wall Street',
        slug: 'comercial-lobo-de-wall-street',
        description: 'Dobrou a meta mensal e quebrou o recorde de vendas.',
        category: 'comercial',
        rarity: 'epic',
        xp: 100,
        pts: 75,
        icon: 'Rocket',
      },
    ]

    const colors = { common: '#64748b', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7' }

    achievementsData.forEach((d) => {
      try {
        const existing = app.findFirstRecordByData('achievements', 'slug', d.slug)
        if (!existing) {
          const r = new Record(col)
          r.set('name', d.name)
          r.set('slug', d.slug)
          r.set('description', d.description)
          r.set('category', d.category)
          r.set('icon', d.icon)
          r.set('requirement_type', 'manual')
          r.set('requirement_value', 100)
          r.set('points_reward', d.pts)
          r.set('xp_reward', d.xp)
          r.set('rarity', d.rarity)
          r.set('badge_color', colors[d.rarity])
          r.set('is_active', true)
          r.set('is_hidden', false)
          app.save(r)
        }
      } catch (e) {
        const r = new Record(col)
        r.set('name', d.name)
        r.set('slug', d.slug)
        r.set('description', d.description)
        r.set('category', d.category)
        r.set('icon', d.icon)
        r.set('requirement_type', 'manual')
        r.set('requirement_value', 100)
        r.set('points_reward', d.pts)
        r.set('xp_reward', d.xp)
        r.set('rarity', d.rarity)
        r.set('badge_color', colors[d.rarity])
        r.set('is_active', true)
        r.set('is_hidden', false)
        app.save(r)
      }
    })
  },
  (app) => {
    const col = app.findCollectionByNameOrId('achievements')
    const categories = ['licitacao', 'digitadora', 'financas', 'engenharia_ia', 'comercial']
    categories.forEach((c) => {
      try {
        const recs = app.findRecordsByFilter('achievements', `category = '${c}'`, '', 100, 0)
        recs.forEach((r) => app.delete(r))
      } catch (e) {}
    })
  },
)
