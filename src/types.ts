// ゲーム全体で使う型定義

export type SkillId = 'vaccine' | 'url' | 'tfa' | 'firewall'

export interface Skill {
  id: SkillId
  name: string
  mp: number
  type: 'attack' | 'buff'
}

export type EnemyId = 'slime' | 'angler' | 'maou'

// 会話の立ち絵を含むスプライトのID
export type SpriteId = EnemyId | 'fairy'

// セキュリティ手帳(図鑑)の1エントリ
export interface ZukanEntry {
  no: string
  real: string
  taisaku: string
  genjitsu: string // げんじつファイル(現実の事例解説)
  source: string
  link: string
}

export interface Enemy {
  id: EnemyId
  name: string
  lv: number | string // 魔王は '??'
  hp: number
  weak: SkillId | null // 魔王は弱点なし(スクリプトバトル)
  boss: boolean
  intro: string[]
  hint: string
  zukan: ZukanEntry | null
}

// box-shadowドット絵の定義
export interface SpriteData {
  px: number
  colors: Record<string, string>
  map: string[]
}

// メッセージ表示と同時に適用される数値変化・演出。
// テキスト中の {n} はプレイヤー名に差し込まれる
export interface Fx {
  eHp?: number
  pHp?: number
  pMp?: number
  fw?: number // ファイアウォールの残りターン数(上書き)
  mPhase?: number // 魔王戦の段階(上書き): 0=無敵 1=クローン展開後 2=弱点発生
  mActs?: number // 魔王戦・無敵段階での行動回数(上書き)
  eFlash?: boolean
  shake?: boolean
  weak?: boolean
}

// イベントキュー消化後の遷移先
export type QueueEnd = 'command' | 'flow' | 'gameover'

export interface BattleEvent {
  t: string
  fx?: Fx | null
  then?: QueueEnd
  skip?: boolean // 表示せず fx だけ適用するイベント
}

// 会話パート
export type StoryId =
  | 'prologue'
  | 'ch1_open'
  | 'boss_pre'
  | 'boss_post'
  | 'final_pre'
  | 'ending'

export interface StoryLine {
  s: string // 話者('' = 地の文)
  t: string
}

export interface Story {
  title: string
  lines: StoryLine[]
}

// ゲーム進行の1ステップ
export type FlowItem =
  | { k: 'story'; id: StoryId }
  | { k: 'battle'; e: EnemyId }
  | { k: 'lesson'; e: EnemyId }
  | { k: 'end' } // 第1章クリア
  | { k: 'end2' } // 最終決戦後の「完」

export type Menu = 'main' | 'skill'
