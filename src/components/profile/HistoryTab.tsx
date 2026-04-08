import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { History, Target } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PointHistory } from '@/services/gamification'
import { cn } from '@/lib/utils'

export function HistoryTab({ history }: { history: PointHistory[] }) {
  return (
    <div className="animate-fade-in-up">
      <Card className="bg-background/60 backdrop-blur-md border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Registro de Pontos
              </CardTitle>
              <CardDescription>Acompanhe todas as suas movimentações de pontos.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="w-[180px]">Data</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Movimentação</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Saldo Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Target className="w-12 h-12 opacity-20 mb-3" />
                        <p>Nenhum ponto registrado ainda.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((record) => {
                    const isPositive = record.points > 0
                    return (
                      <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {format(parseISO(record.created), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm text-foreground">
                            {record.reason}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={isPositive ? 'default' : 'destructive'}
                            className={cn(
                              'font-bold',
                              isPositive &&
                                'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20',
                              !isPositive &&
                                'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20',
                            )}
                          >
                            {isPositive ? '+' : ''}
                            {record.points}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground hidden sm:table-cell">
                          {record.balance_after} pts
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
