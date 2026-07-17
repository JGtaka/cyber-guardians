import { Window } from '../components/Window'
import { CLEARS } from '../data/story'

const bigBtnCls =
  'cursor-pointer rounded-[3px] border-4 border-white px-[30px] py-2.5 text-center text-[16px]'

// 章クリア画面(内容は data/story.ts の CLEARS で章ごとに定義)。
// 最終決戦への導線は CLAUDE.md の公開方針により v5 まで出さない
// (実装は移植済み。動作確認はデバッグメニューの章ジャンプ実装後にそちらから行う)
export function ClearScreen({
  ch,
  onNext,
  onTitle,
}: {
  ch: number
  onNext?: () => void // 次章へ(未実装の章の前では出さない)
  onTitle: () => void
}) {
  const clear = CLEARS[ch]
  return (
    <div className="py-3.5 text-center">
      <h2 className="mb-4 text-[22px] font-normal text-patch">
        ★ 第{ch}章 クリア! ★
      </h2>
      <Window className="mb-3.5 text-left text-[14px] leading-loose">
        今日おぼえた対策:
        {clear.learned.map((l) => (
          <span key={l}>
            <br />・{l}
          </span>
        ))}
      </Window>
      <Window className="mb-3.5 text-left text-[13px] leading-[1.9] text-sub">
        {clear.teaser}
      </Window>
      <div className="flex flex-col items-center gap-2.5">
        {clear.hasNext && onNext && (
          <button className={bigBtnCls} onClick={onNext}>
            ▶ 第{ch + 1}章へ すすむ
          </button>
        )}
        <button className={bigBtnCls} onClick={onTitle}>
          ▶ タイトルへ もどる
        </button>
      </div>
    </div>
  )
}
