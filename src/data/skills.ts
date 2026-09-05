import type { Skill, SkillId } from '../types'

// プレイヤーのスキル(= 現実のセキュリティ対策)
export const SKILLS: Skill[] = [
  { id: 'vaccine', name: 'ワクチンスキャン', mp: 8, type: 'attack' },
  { id: 'url', name: 'URLかくにん', mp: 8, type: 'attack' },
  { id: 'scan', name: 'ダウンロードまえにスキャン', mp: 8, type: 'attack' },
  { id: 'tfa', name: '二要素認証', mp: 8, type: 'attack' },
  { id: 'peek', name: 'のぞきみブロック', mp: 8, type: 'attack' },
  { id: 'backup', name: 'バックアップ', mp: 8, type: 'attack' },
  { id: 'call', name: 'かくにんのでんわ', mp: 8, type: 'attack' },
  { id: 'traffic', name: 'トラフィックせいぎょ', mp: 8, type: 'attack' },
  { id: 'firewall', name: 'ファイアウォール', mp: 10, type: 'buff' },
]

// アングラー戦でスキル欄に混ぜられるニセスキル(フィッシングの体験。issue #25)。
// 本物『URLかくにん』の真上に並び、名前は全角文字で「文字の形が違う」偽ドメイン風。
// MPも本物と同じ表示にして、見た目の違和感だけで見破らせる
export const LURE_SKILL = {
  name: 'ＵＲＬかくにん',
  mimics: 'url' as SkillId,
  mp: 8,
}
