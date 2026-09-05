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

// トロイの木馬将軍がバトル中に差し出す贈り物(所持品ではなく、そのバトル限定。issue #25)。
// 便利なもののフリをして入り込む=中に木馬の兵が潜んでいる
export const GIFT = {
  name: 'かいふくのくすり',
  desc: '将軍の贈り物。稼働率が 20 回復…らしい',
  heal: 20,
  burst: 24, // 潜伏していた木馬の兵の内部ダメージ(防御では防げない)
}

const grantFi = (item: Item) =>
  FLOW.findIndex((f) => f.k === 'story' && f.id === item.grantedBy)

// FLOW の fi 時点で所持しているアイテム(受け取る会話より後なら所持)
export const itemsAt = (fi: number): Item[] =>
  Object.values(ITEMS).filter((it) => {
    const g = grantFi(it)
    return g >= 0 && fi > g
  })
