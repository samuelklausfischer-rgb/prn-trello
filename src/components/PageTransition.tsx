import { ReactNode, useEffect, useState } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`h-full w-full transition-all duration-500 ease-out will-change-[opacity,transform] ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}
