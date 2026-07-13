import { DEFAULT_NAME, NAME_MAX_LEN, SAVE_KEY } from '../data/constants'
import { ENEMIES } from '../data/enemies'
import { STORIES } from '../data/story'
import type { EnemyId, StoryId } from '../types'

// localStorage セーブ(CLAUDE.md: 名前・章・図鑑解放を含む)。
// seenStories は会話パートの既読スキップ用

export interface SaveData {
  v: 1
  name: string
  chapter: number // クリア済みの章(0 = 未クリア)
  zukan: EnemyId[] // 図鑑(セキュリティ手帳)の解放済み敵
  seenStories: StoryId[]
  muted: boolean // ミュート状態(docs/sound.md: セーブに含める)
}

export const emptySave: SaveData = {
  v: 1,
  name: DEFAULT_NAME,
  chapter: 0,
  zukan: [],
  seenStories: [],
  muted: false,
}

// 名前の正規化(空白除去・6文字まで。空ならデフォルト名)
export const sanitizeName = (raw: string) =>
  raw.replace(/\s/g, '').slice(0, NAME_MAX_LEN) || DEFAULT_NAME

const isEnemyId = (v: unknown): v is EnemyId =>
  typeof v === 'string' && v in ENEMIES

const isStoryId = (v: unknown): v is StoryId =>
  typeof v === 'string' && v in STORIES

// 壊れたセーブや古い形式でも落ちないよう、1項目ずつ検証して取り込む
export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const d: unknown = JSON.parse(raw)
    if (typeof d !== 'object' || d === null) return null
    const o = d as Record<string, unknown>
    return {
      v: 1,
      name: typeof o.name === 'string' ? sanitizeName(o.name) : DEFAULT_NAME,
      chapter: typeof o.chapter === 'number' ? o.chapter : 0,
      zukan: Array.isArray(o.zukan) ? o.zukan.filter(isEnemyId) : [],
      seenStories: Array.isArray(o.seenStories)
        ? o.seenStories.filter(isStoryId)
        : [],
      muted: o.muted === true,
    }
  } catch {
    return null
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // プライベートモード等で保存できなくてもゲームは続行する
  }
}
