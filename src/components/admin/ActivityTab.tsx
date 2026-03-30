import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getTaskHistory } from '@/services/history'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function ActivityTab() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getTaskHistory()
      .then((data) => {
        if (mounted) {
          setHistory(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card className="border-border/60 shadow-sm glass-card">
      <CardHeader>
        <CardTitle>Log de Atividades do Sistema</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe em tempo real as ações realizadas na plataforma.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {h.created ? format(new Date(h.created), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {h.expand?.performed_by?.name || 'Sistema'}
                  </TableCell>
                  <TableCell>
                    <span className="bg-accent/10 text-accent px-2.5 py-1 rounded-md text-xs font-semibold">
                      {h.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{h.description || '-'}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Nenhuma atividade registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
