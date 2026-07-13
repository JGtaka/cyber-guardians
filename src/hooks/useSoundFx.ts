import { useEffect, useRef } from 'react'
import { playBgm, playSe } from '../game/sound'
import type { BattleEvent } from '../types'

// 表示中イベントの fx に応じて効果音・勝利ジングルを鳴らす。
// useVisualFx と同じ依存で発火するので、フラッシュ・シェイクと音が同期する
export function useSoundFx(queue: BattleEvent[], qi: number) {
  // StrictMode の二重実行や再レンダーで同じイベントの音が重ならないようにする
  const played = useRef<{ queue: BattleEvent[]; qi: number } | null>(null)

  useEffect(() => {
    if (played.current?.queue === queue && played.current.qi === qi) return
    played.current = { queue, qi }
    const fx = qi >= 0 ? queue[qi]?.fx : null
    if (!fx) return
    if (fx.weak) playSe('weak') // WEAK POINT演出の画面フラッシュと同時に鳴らす
    else if (fx.shake) playSe('damage') // 被弾は画面シェイクと同時
    else if (fx.se) playSe(fx.se)
    if (fx.win) playBgm('jgl_win')
  }, [queue, qi])
}
