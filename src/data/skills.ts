import type { Skill } from '../types'

// プレイヤーのスキル(= 現実のセキュリティ対策)
export const SKILLS: Skill[] = [
  { id: 'vaccine', name: 'ワクチンスキャン', mp: 8, type: 'attack' },
  { id: 'url', name: 'URLかくにん', mp: 8, type: 'attack' },
  { id: 'scan', name: 'ダウンロードまえにスキャン', mp: 8, type: 'attack' },
  { id: 'tfa', name: '二要素認証', mp: 8, type: 'attack' },
  { id: 'peek', name: 'のぞきみブロック', mp: 8, type: 'attack' },
  { id: 'firewall', name: 'ファイアウォール', mp: 10, type: 'buff' },
]
