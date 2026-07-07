import { SPRITES } from '../data/sprites'
import type { EnemyId } from '../types'

// box-shadow方式のドット絵スプライト。flash 中は全ピクセルを白にする
export function Sprite({ id, flash = false }: { id: EnemyId; flash?: boolean }) {
  const s = SPRITES[id]
  const shadows: string[] = []
  s.map.forEach((row, y) => {
    Array.from(row).forEach((ch, x) => {
      if (s.colors[ch]) {
        shadows.push(
          `${x * s.px}px ${y * s.px}px 0 ${flash ? '#ffffff' : s.colors[ch]}`,
        )
      }
    })
  })
  return (
    <div
      className="relative"
      style={{ width: s.map[0].length * s.px, height: s.map.length * s.px }}
    >
      <div
        className="bg-transparent"
        style={{ width: s.px, height: s.px, boxShadow: shadows.join(',') }}
      />
    </div>
  )
}
