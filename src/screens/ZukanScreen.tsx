import { useState } from 'react'
import { ZUKAN_ENEMIES } from '../data/enemies'
import { playSe } from '../game/sound'
import { ZukanArticle } from './LessonScreen'
import type { EnemyId, ZukanEntry } from '../types'

const backBtnCls =
  'w-full cursor-pointer rounded-[3px] border-4 border-white py-2.5 text-center text-[16px]'

// "No.001 ワーム" から番号部分だけを取り出す(未記録の名前を伏せる用)
const noOf = (zukan: ZukanEntry) => zukan.no.split(' ')[0]

// タイトルから開くセキュリティ手帳の閲覧画面。
// 記録済みのエントリは撃破後と同じ解説を読み返せる。未記録は ??? で伏せる
export function ZukanScreen({
  zukanIds,
  zukanCount,
  zukanTotal,
  onClose,
}: {
  zukanIds: EnemyId[] // 記録済みの敵ID
  zukanCount: number
  zukanTotal: number
  onClose: () => void
}) {
  const [selected, setSelected] = useState<ZukanEntry | null>(null)

  return (
    <div>
      <p className="mb-2 flex justify-between text-[13px] text-sub">
        <span>■ セキュリティ手帳</span>
        <span className="text-patch">
          きろく {zukanCount}/{zukanTotal}
        </span>
      </p>
      {selected ? (
        <>
          <ZukanArticle zukan={selected} />
          <button
            className={backBtnCls}
            onClick={() => {
              playSe('cursor')
              setSelected(null)
            }}
          >
            ◀ いちらんに もどる
          </button>
        </>
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-2">
            {ZUKAN_ENEMIES.map((e) =>
              zukanIds.includes(e.id) ? (
                <button
                  key={e.id}
                  className="cursor-pointer rounded-[3px] border-4 border-white px-3 py-2 text-left text-[14px]"
                  onClick={() => {
                    playSe('decide')
                    setSelected(e.zukan)
                  }}
                >
                  {e.zukan.no} ▶
                </button>
              ) : (
                <div
                  key={e.id}
                  className="rounded-[3px] border-4 border-disabled px-3 py-2 text-[14px] text-disabled"
                >
                  {noOf(e.zukan)} ??? まだ きろくが ない
                </div>
              ),
            )}
          </div>
          <button className={backBtnCls} onClick={onClose}>
            ◀ タイトルに もどる
          </button>
        </>
      )}
    </div>
  )
}
