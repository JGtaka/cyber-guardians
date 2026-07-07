// ゲーム全体で使う型定義

export type SkillId = 'vaccine' | 'url' | 'tfa' | 'firewall'

export interface Skill {
  id: SkillId
  name: string
  mp: number
  type: 'attack' | 'buff'
}

export type EnemyId = 'slime' | 'angler' | 'golem'

// セキュリティ手帳(図鑑)の1エントリ
export interface ZukanEntry {
  no: string
  real: string
  taisaku: string
}

export interface Enemy {
  id: EnemyId
  name: string
  lv: number
  hp: number
  weak: SkillId
  intro: string[]
  hint: string
  zukan: ZukanEntry
}

// box-shadowドット絵の定義
export interface SpriteData {
  px: number
  colors: Record<string, string>
  map: string[]
}

// メッセージ表示と同時に適用される数値変化・演出
export interface Fx {
  eHp?: number
  pHp?: number
  pMp?: number
  fw?: number // ファイアウォールの残りターン数(上書き)
  golem?: number // ゴーレムの攻撃力上昇量(加算)
  eFlash?: boolean
  shake?: boolean
  weak?: boolean
}

// イベントキュー消化後の遷移先
export type QueueEnd = 'command' | 'lesson' | 'gameover'

export interface BattleEvent {
  t: string
  fx?: Fx | null
  then?: QueueEnd
  skip?: boolean // 表示せず fx だけ適用するイベント
}

export type Phase = 'title' | 'battle' | 'lesson' | 'clear' | 'gameover'
export type Menu = 'main' | 'skill'
