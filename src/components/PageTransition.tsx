import { ReactNode } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  return <div className="animate-slide-up h-full w-full">{children}</div>
}
