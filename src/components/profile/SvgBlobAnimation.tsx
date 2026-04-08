import { memo } from 'react'

export const SvgBlobAnimation = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
      <div
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '4s' }}
      />
    </div>
  )
})
