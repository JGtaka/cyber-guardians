import { Howl, Howler } from 'howler'
import { emptySave, loadSave, writeSave } from './save'
import type { BgmId, SeId } from '../types'

// サウンド管理(docs/sound.md の実装仕様)。
// - SEは起動時プリロード、BGMは遅延ロード(初回ロード3秒以内の非機能要件)
// - BGM切替はクロスフェード0.5秒
// - ブラウザの自動再生制限のため、最初のユーザー操作(playSe)まではBGMを保留する
// - ミュート状態は localStorage セーブに含める

const BGM_BASE_VOL = 0.4
const SE_BASE_VOL = 0.7
const FADE_MS = 500

// vol は曲ごとの音量係数(実音量 = 基準音量 × vol。テストプレイで調整する)
const BGM_DEFS: Record<BgmId, { loop: boolean; vol: number }> = {
  title: { loop: true, vol: 1 },
  daily: { loop: true, vol: 1 },
  btl_normal: { loop: true, vol: 1 },
  btl_boss: { loop: true, vol: 1 },
  btl_final: { loop: true, vol: 1 }, // 最終決戦(魔王戦)用
  jgl_win: { loop: false, vol: 1 }, // ジングルはループなし=鳴り終わると無音
  jgl_clear: { loop: false, vol: 1 },
  jgl_gameover: { loop: false, vol: 1 },
}

const SE_DEFS: Record<SeId, { vol: number }> = {
  attack: { vol: 1 },
  skill: { vol: 1 },
  weak: { vol: 1 },
  damage: { vol: 1 },
  cursor: { vol: 0.8 },
  decide: { vol: 1 },
  message: { vol: 0.6 }, // 連打されるので小さめ(docs/sound.md)
  continue: { vol: 1 },
}

const src = (dir: 'bgm' | 'se', file: string) =>
  `${import.meta.env.BASE_URL}${dir}/${file}.mp3`

// SEは全種プリロード(短いファイルのみなので初回ロードへの影響は軽微)
const seHowls = Object.fromEntries(
  (Object.keys(SE_DEFS) as SeId[]).map((id) => [
    id,
    new Howl({
      src: [src('se', `se_${id}`)],
      volume: SE_BASE_VOL * SE_DEFS[id].vol,
      preload: true,
    }),
  ]),
) as Record<SeId, Howl>

// BGMは最初に要求された時にロードする
const bgmHowls = new Map<BgmId, Howl>()

function getBgm(id: BgmId): Howl {
  let howl = bgmHowls.get(id)
  if (!howl) {
    howl = new Howl({
      src: [src('bgm', id)],
      loop: BGM_DEFS[id].loop,
      volume: 0,
    })
    // ジングルが鳴り終わったら再生中扱いを解除する(次に同じ曲を頭から鳴らせるように)
    howl.on('end', () => {
      if (!BGM_DEFS[id].loop && current?.id === id) current = null
    })
    bgmHowls.set(id, howl)
  }
  return howl
}

let current: { id: BgmId; howl: Howl } | null = null
let pendingBgm: BgmId | null = null // 自動再生制限の解除待ちの曲
let unlocked = false
let muted = loadSave()?.muted ?? false
Howler.mute(muted)

// ブラウザの自動再生制限を解除し、保留中のBGMを開始する。
// 操作前の自動再生はブラウザにブロックされるため、最初のクリック/タップ/キー入力を合図にする
function unlock() {
  if (unlocked) return
  unlocked = true
  if (pendingBgm) {
    const id = pendingBgm
    pendingBgm = null
    playBgm(id)
  }
}
document.addEventListener('pointerdown', unlock, { once: true })
document.addEventListener('keydown', unlock, { once: true })

export function playSe(id: SeId) {
  unlock()
  seHowls[id].play()
}

// 現在の曲からクロスフェードで切り替える。同じ曲なら何もしない
export function playBgm(id: BgmId) {
  if (!unlocked) {
    pendingBgm = id
    return
  }
  if (current?.id === id) return
  if (current) {
    const old = current.howl
    old.fade(old.volume(), 0, FADE_MS)
    old.once('fade', () => old.stop())
  }
  const howl = getBgm(id)
  current = { id, howl }
  const start = () => {
    // ロード待ちの間に別の曲へ切り替わっていたら鳴らさない
    if (current?.id !== id) return
    howl.stop()
    howl.volume(0)
    howl.play()
    howl.fade(0, BGM_BASE_VOL * BGM_DEFS[id].vol, FADE_MS)
  }
  if (howl.state() === 'loaded') start()
  else {
    howl.once('load', start)
    howl.load()
  }
}

export function stopBgm() {
  if (!current) return
  const old = current.howl
  current = null
  old.fade(old.volume(), 0, FADE_MS)
  old.once('fade', () => old.stop())
}

export const isMuted = () => muted

// ミュートを切り替え、状態をセーブに書き込んで返す
export function toggleMute(): boolean {
  muted = !muted
  Howler.mute(muted)
  writeSave({ ...(loadSave() ?? emptySave), muted })
  return muted
}
