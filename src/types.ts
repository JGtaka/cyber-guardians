// ゲーム全体で使う型定義

export type SkillId =
  | 'vaccine'
  | 'url'
  | 'scan'
  | 'tfa'
  | 'peek'
  | 'backup'
  | 'call'
  | 'firewall'

export interface Skill {
  id: SkillId
  name: string
  mp: number
  type: 'attack' | 'buff'
}

export type EnemyId =
  | 'slime'
  | 'angler'
  | 'slime2'
  | 'trojan'
  | 'goblin'
  | 'golem'
  | 'witch'
  | 'demon'
  | 'maou'

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

// 効果音のID(public/se/se_<id>.mp3 に対応。docs/sound.md のトリガー対応表参照)
export type SeId =
  | 'attack' // 攻撃ヒット
  | 'skill' // スキル命中(弱点以外)・バフ展開
  | 'weak' // WEAK POINT(画面フラッシュと同時)
  | 'damage' // 被弾(画面シェイクと同時)
  | 'cursor' // メニュー切替
  | 'decide' // 決定
  | 'message' // メッセージ送り
  | 'continue' // ゲームオーバーからのリトライ

// BGMのID(public/bgm/<id>.mp3 に対応)
export type BgmId =
  | 'title'
  | 'daily'
  | 'btl_normal'
  | 'btl_boss'
  | 'btl_final' // 最終決戦用(v5まで未使用)
  | 'jgl_win'
  | 'jgl_clear'
  | 'jgl_gameover'

// メッセージ表示と同時に適用される数値変化・演出。
// テキスト中の {n} はプレイヤー名に差し込まれる
export interface Fx {
  eHp?: number
  pHp?: number
  pMp?: number
  fw?: number // ファイアウォールの残りターン数(上書き)
  eAtk?: number // 敵の攻撃力ボーナス(上書き。ゴーレムの毎ターン上昇ギミック用)
  psn?: number // まどわしの毒の残りターン数(上書き。ウィッチのギミック用)
  seal?: SkillId | null // 暗号化封印中のスキル(上書き。null=解除。デーモンのギミック用)
  mPhase?: number // 魔王戦の段階(上書き): 0=無敵 1=クローン展開後 2=弱点発生
  mActs?: number // 魔王戦・無敵段階での行動回数(上書き)
  eFlash?: boolean
  shake?: boolean
  weak?: boolean
  se?: SeId // このイベント表示と同時に鳴らす効果音(weak/shake があればそちら優先)
  win?: boolean // 勝利ジングルを開始する(バトルBGMをフェードアウト)
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
  | 'ch2_open'
  | 'boss2_pre'
  | 'boss2_post'
  | 'ch3_open'
  | 'boss3_pre'
  | 'boss3_post'
  | 'ch4_open'
  | 'boss4_pre'
  | 'boss4_post'
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
  | { k: 'end'; ch: number } // 章クリア(ch = クリアした章番号)
  | { k: 'end2' } // 最終決戦後の「完」

export type Menu = 'main' | 'skill'
