import { useEffect, useRef } from 'react'
import { playBgm, playSe, stopBgm } from '../game/sound'
import type { BattleEvent } from '../types'

// 表示中イベントの fx に応じて効果音・獲得ジングルを鳴らす。
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
    // ジングルは手帳記録(獲得)の1本のみ。撃破時はバトルBGMを止めて
    // 一瞬の静寂を作り、次の「きろくされた!」で jgl_clear を際立たせる
    if (fx.record) playBgm('jgl_clear')
    else if (fx.win) stopBgm()
  }, [queue, qi])
}
