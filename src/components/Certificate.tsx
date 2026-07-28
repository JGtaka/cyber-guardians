import { useEffect, useRef } from 'react'
import { playSe } from '../game/sound'

// クリア特典の「情シス見習い免許証」。Canvasに描画してそのままプレビュー表示し、
// 保存ボタンでPNGとしてダウンロードする(プレビュー=保存画像の単一ソース)。
// プレイヤー名は fillText 描画のためHTMLを経由しない
const W = 720
const H = 456

function draw(
  canvas: HTMLCanvasElement,
  name: string,
  zukanCount: number,
  zukanTotal: number,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const font = (px: number) => `${px}px "DotGothic16", monospace`

  ctx.fillStyle = '#14142b'
  ctx.fillRect(0, 0, W, H)
  // 二重枠で賞状らしく(外=太枠、内=細枠)
  ctx.strokeStyle = '#f5f5ff'
  ctx.lineWidth = 8
  ctx.strokeRect(10, 10, W - 20, H - 20)
  ctx.lineWidth = 2
  ctx.strokeRect(24, 24, W - 48, H - 48)

  // スマホ幅ではプレビューが約0.5倍に縮小されるため、文字は大きめに描く
  ctx.textAlign = 'center'
  ctx.fillStyle = '#aab4e8'
  ctx.font = font(24)
  ctx.fillText('ネット王国情報システム課 認定', W / 2, 88)
  ctx.fillStyle = '#f5f5ff'
  ctx.font = font(44)
  ctx.fillText('情シス見習い免許証', W / 2, 152)
  ctx.fillStyle = '#fac775'
  ctx.font = font(34)
  ctx.fillText(`${name} どの`, W / 2, 220)
  ctx.fillStyle = '#f5f5ff'
  ctx.font = font(24)
  ctx.fillText('数々のサイバー攻撃を 見抜き、正しい対策で', W / 2, 282)
  ctx.fillText('ネット王国を 守ったことを ここに認定します', W / 2, 318)
  ctx.fillStyle = '#5dcaa5'
  ctx.font = font(22)
  ctx.fillText(
    `セキュリティ手帳 きろく ${zukanCount}/${zukanTotal}`,
    W / 2,
    370,
  )
  const d = new Date()
  ctx.fillStyle = '#aab4e8'
  ctx.font = font(20)
  ctx.fillText(
    `発行日 ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`,
    W / 2,
    408,
  )

  // 手帳記録演出とおそろいの赤丸スタンプ
  ctx.save()
  ctx.translate(W - 116, H - 112)
  ctx.rotate((-12 * Math.PI) / 180)
  ctx.strokeStyle = '#e24b4a'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(0, 0, 50, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#e24b4a'
  ctx.font = font(24)
  ctx.fillText('認定', 0, 9)
  ctx.restore()
}

export function Certificate({
  name,
  zukanCount,
  zukanTotal,
}: {
  name: string
  zukanCount: number
  zukanTotal: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let cancelled = false
    const drawNow = () => {
      if (!cancelled) draw(canvas, name, zukanCount, zukanTotal)
    }
    // Canvasのフォント指定はロード済みでないと代替フォントで描かれるため先に読み込む
    document.fonts.load('42px "DotGothic16"').then(drawNow, drawNow)
    return () => {
      cancelled = true
    }
  }, [name, zukanCount, zukanTotal])

  const save = () => {
    playSe('decide')
    const canvas = ref.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'cyber-guardians-license.png'
    a.click()
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={W}
        height={H}
        className="h-auto w-full rounded-[3px]"
        aria-label={`${name}の 情シス見習い免許証`}
      />
      <button
        className="mt-2.5 w-full cursor-pointer rounded-[3px] border-4 border-white py-2.5 text-center text-[16px]"
        onClick={save}
      >
        ▶ めんきょしょうを ほぞん(画像)
      </button>
    </div>
  )
}
