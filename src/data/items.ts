import type { Item, ItemId } from '../types'
import { FLOW } from './story'

// アイテム(= 現実の物理的な対策)。会話で受け取り、以降のバトルで使える。
// 所持は「その会話を通過したか(FLOW位置)」から導くので、セーブ形式は変えない
export const ITEMS: Record<ItemId, Item> = {
  filter: {
    id: 'filter',
    name: '覗き見防止フィルター',
    desc: '画面を横から見えなくする。覗き見への備え',
    grantedBy: 'ch3_open',
  },
}

const grantFi = (item: Item) =>
  FLOW.findIndex((f) => f.k === 'story' && f.id === item.grantedBy)

// FLOW の fi 時点で所持しているアイテム(受け取る会話より後なら所持)
export const itemsAt = (fi: number): Item[] =>
  Object.values(ITEMS).filter((it) => {
    const g = grantFi(it)
    return g >= 0 && fi > g
  })
