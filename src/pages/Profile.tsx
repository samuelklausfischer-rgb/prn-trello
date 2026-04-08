import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuthHooks'
import { getPointsHistory, getLevels, PointHistory, Level } from '@/services/gamification'
import { getUserAchievements, UserAchievement } from '@/services/achievements'
import { updateUser } from '@/services/users'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageTransition from '@/components/PageTransition'
import { SvgBlobAnimation } from '@/components/profile/SvgBlobAnimation'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { OverviewTab } from '@/components/profile/OverviewTab'
import { HistoryTab } from '@/components/profile/HistoryTab'
import { AchievementsTab } from '@/components/profile/AchievementsTab'
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [history, setHistory] = useState<PointHistory[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    role: '',
    job_title: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        role: user.role || 'EMPLOYEE',
        job_title: user.job_title || '',
      })
    }
  }, [user, isEditing])

  const loadData = async () => {
    if (!user) return
    try {
      const [histData, levelsData, achData] = await Promise.all([
        getPointsHistory(user.id),
        getLevels(),
        getUserAchievements(user.id),
      ])
      setHistory(histData)
      setLevels(levelsData)
      setAchievements(achData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  useRealtime(
    'points_history',
    (e) => {
      if (e.action === 'create' && e.record.user_id === user?.id) {
        setHistory((prev) => [e.record as unknown as PointHistory, ...prev])
      }
    },
    !!user,
  )

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        job_title: formData.job_title,
        role: formData.role.toLowerCase(),
      }
      const updatedRecord = await updateUser(user.id, payload)
      pb.authStore.save(pb.authStore.token, updatedRecord)
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas.' })
      setIsEditing(false)
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Erro ao salvar alterações.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Carregando...
      </div>
    )
  }

  const currentLevel = levels.find((l) => l.level_number === user.level) || levels[0]
  const nextLevel = levels.find((l) => l.level_number === user.level + 1)

  return (
    <PageTransition>
      <SvgBlobAnimation />
      <div className="space-y-8 pb-8 animate-fade-in relative z-10">
        <ProfileHero user={user} onEdit={() => setIsEditing(true)} />

        <Tabs defaultValue="overview" className="w-full">
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="w-full justify-start min-w-max md:justify-center bg-background/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <OverviewTab user={user} currentLevel={currentLevel} nextLevel={nextLevel} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab history={history} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab achievements={achievements} />
          </TabsContent>
        </Tabs>

        <ProfileEditDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveProfile}
          saving={saving}
        />
      </div>
    </PageTransition>
  )
}
