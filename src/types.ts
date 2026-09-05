// ゲーム全体で使う型定義

export type SkillId =
  | 'vaccine'
  | 'url'
  | 'scan'
  | 'tfa'
  | 'lock'
  | 'backup'
  | 'call'
  | 'traffic'
  | 'firewall'

export interface Skill {
  id: SkillId
  name: string
  mp: number
  type: 'attack' | 'buff'
}

// アイテム(= 現実の物理的な対策。バトル中の「アイテム」コマンドから使う)
export type ItemId = 'filter'

export interface Item {
  id: ItemId
  name: string
  desc: string // アイテム欄に添える一言
  grantedBy: StoryId // この会話で手に入る(以降のバトルで使える)
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
  | 'dragon'
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

// 敗北時のBAD ENDING(= その脅威に対策しなかった王国の末路。issue #24)
export interface BadEnd {
  title: string // 末路の見出し(例:「氷づけの王国」)
  story: string[] // 王国の末路(2〜3行。1行ずつ送って表示)
  genjitsu: string // 現実の事例(属性表記でフィクション化)
  source: string
  link: string
  lesson: string // 前向きな締め(クローンコードの台詞)
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
  | 'powerup' // 奥義ミュートスの詠唱(パワーアップ系)

// BGMのID(public/bgm/<id>.mp3 に対応)
export type BgmId =
  | 'title'
  | 'daily'
  | 'btl_normal'
  | 'btl_boss'
  | 'btl_final' // 最終決戦(魔王戦)用
  | 'ending' // 魔王戦後のエピローグ会話用
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
  lure?: boolean // ニセスキルの有無(上書き。アングラーのギミック用)
  eTurns?: number // 敵が行動した回数(上書き。初手固定のギミック判定用)
  filter?: boolean // 覗き見防止フィルター展開中(上書き。ゴブリンのギミック用)
  mPhase?: number // 魔王戦の段階(上書き): 0=無敵 1=クローン展開後 2=弱点発生
  mActs?: number // 魔王戦・無敵段階での行動回数(上書き)
  eFlash?: boolean
  shake?: boolean
  weak?: boolean
  se?: SeId // このイベント表示と同時に鳴らす効果音(weak/shake があればそちら優先)
  win?: boolean // 撃破の締め(バトルBGMをフェードアウト。ジングルは record 側で鳴る)
  record?: boolean // 手帳記録演出(ページめくり+スタンプ+jgl_clear)
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
  | 'ch5_open'
  | 'boss5_pre'
  | 'boss5_post'
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

export type Menu = 'main' | 'skill' | 'item'
