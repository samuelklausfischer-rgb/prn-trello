import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Download, FileText } from 'lucide-react'

export function ExportButtons() {
  const exportFile = (type: string) => {
    toast({
      title: `Exportando ${type}`,
      description: 'O download do seu relatório começará em instantes.',
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportFile('PDF')}
        className="shadow-sm font-medium"
      >
        <FileText className="w-4 h-4 mr-2 text-destructive" /> Exportar PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportFile('CSV')}
        className="shadow-sm font-medium"
      >
        <Download className="w-4 h-4 mr-2 text-success" /> Exportar CSV
      </Button>
    </div>
  )
}
