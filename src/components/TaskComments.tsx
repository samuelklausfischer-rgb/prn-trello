import { useState, useEffect } from 'react'
import {
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
  TaskCommentRecord,
} from '@/services/task_comments'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<TaskCommentRecord[]>([])
  const [newComment, setNewComment] = useState('')
  const currentUserId = pb.authStore.record?.id
  const { toast } = useToast()

  const loadComments = async () => {
    try {
      const data = await getTaskComments(taskId)
      setComments(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadComments()
  }, [taskId])

  useRealtime('task_comments', (e) => {
    if (e.record.task_id === taskId) {
      loadComments()
    }
  })

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    try {
      await createTaskComment(taskId, newComment)
      setNewComment('')
    } catch (e) {
      toast({
        title: 'Erro ao enviar comentário',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 bg-muted/30 p-3 rounded-xl border border-border/40"
          >
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarImage src={comment.expand?.user_id?.avatar} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {comment.expand?.user_id?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate pr-2">
                  {comment.expand?.user_id?.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {format(new Date(comment.created), 'dd MMM HH:mm', { locale: ptBR })}
                  </span>
                  {(currentUserId === comment.user_id || pb.authStore.record?.role === 'admin') && (
                    <button
                      onClick={() => deleteTaskComment(comment.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors outline-none"
                      title="Excluir comentário"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap text-foreground/90 leading-snug">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70 mt-8">
            <p className="text-sm font-medium">Nenhum comentário ainda.</p>
            <p className="text-xs">Seja o primeiro a comentar nesta tarefa.</p>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 shrink-0 border-t pt-4 border-border/40">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="resize-none h-16 sm:h-20"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <Button
          onClick={handleSubmit}
          className="sm:h-20 shrink-0 shadow-sm"
          disabled={!newComment.trim()}
        >
          Enviar
        </Button>
      </div>
    </div>
  )
}
