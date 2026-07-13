import { useState } from 'react'
import { isMuted, toggleMute } from '../game/sound'

// ミュート切替ボタン(docs/sound.md: タイトルとバトル画面に配置)。
// 状態は sound.ts が保持しセーブにも書き込むので、ここは表示を追従させるだけ
export function MuteButton({ className = '' }: { className?: string }) {
  const [muted, setMuted] = useState(isMuted)
  return (
    <button
      className={`cursor-pointer rounded-[3px] border-2 border-white px-1.5 py-0.5 text-[11px] ${
        muted ? 'text-disabled' : ''
      } ${className}`}
      onClick={() => setMuted(toggleMute())}
      aria-pressed={muted}
      aria-label="サウンドの オン/オフ"
    >
      {muted ? '♪ OFF' : '♪ ON'}
    </button>
  )
}
