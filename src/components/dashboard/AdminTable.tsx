import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Medal } from 'lucide-react'

interface AdminTableProps {
  performance: any[]
}

export function AdminTable({ performance }: AdminTableProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <CardTitle className="text-lg">Desempenho da Equipe</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-foreground py-4">Ranking</TableHead>
              <TableHead className="font-semibold text-foreground">Colaborador</TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Tarefas Totais
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">Concluídas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performance.map((u) => (
              <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-muted-foreground text-sm">
                    {u.rank === 1 ? <Medal className="w-5 h-5 text-accent" /> : `#${u.rank}`}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-foreground">{u.name}</TableCell>
                <TableCell className="text-right font-medium">{u.total}</TableCell>
                <TableCell className="text-right">
                  <span className="text-success font-bold bg-success/10 px-2.5 py-1 rounded-full text-xs">
                    {u.completed}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
