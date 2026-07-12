import { SPRITES } from '../data/sprites'
import type { SpriteId } from '../types'

// box-shadow方式のドット絵スプライト。flash 中は全ピクセルを白にする
export function Sprite({
  id,
  flash = false,
  scale = 1,
}: {
  id: SpriteId
  flash?: boolean
  scale?: number
}) {
  const s = SPRITES[id]
  const px = s.px * scale
  const shadows: string[] = []
  s.map.forEach((row, y) => {
    Array.from(row).forEach((ch, x) => {
      if (s.colors[ch]) {
        shadows.push(
          `${x * px}px ${y * px}px 0 ${flash ? '#ffffff' : s.colors[ch]}`,
        )
      }
    })
  })
  return (
    <div
      className="relative"
      style={{ width: s.map[0].length * px, height: s.map.length * px }}
    >
      <div
        className="bg-transparent"
        style={{ width: px, height: px, boxShadow: shadows.join(',') }}
      />
    </div>
  )
}
