import { useEffect, useState } from 'react'
import type { BattleEvent } from '../types'

// 表示中イベントの fx から、一定時間だけ有効な画面演出フラグを作る
export function useVisualFx(queue: BattleEvent[], qi: number) {
  const [shake, setShake] = useState(false)
  const [weakFx, setWeakFx] = useState(false)
  const [eFlash, setEFlash] = useState(false)

  useEffect(() => {
    const fx = qi >= 0 ? queue[qi]?.fx : null
    if (!fx) return
    const timers: number[] = []
    if (fx.eFlash) {
      setEFlash(true)
      timers.push(window.setTimeout(() => setEFlash(false), 220))
    }
    if (fx.shake) {
      setShake(true)
      timers.push(window.setTimeout(() => setShake(false), 350))
    }
    if (fx.weak) {
      setWeakFx(true)
      timers.push(window.setTimeout(() => setWeakFx(false), 650))
    }
    return () => timers.forEach((t) => clearTimeout(t))
  }, [queue, qi])

  return { shake, weakFx, eFlash }
}
