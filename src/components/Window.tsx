import type { ReactNode } from 'react'

// ドラクエ風の白枠4pxウィンドウ
export function Window({
  className = '',
  onClick,
  children,
}: {
  className?: string
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-[3px] border-4 border-white bg-screen px-3.5 py-2.5 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
