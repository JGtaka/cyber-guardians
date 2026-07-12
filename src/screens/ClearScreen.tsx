import { Window } from '../components/Window'

const bigBtnCls =
  'cursor-pointer rounded-[3px] border-4 border-white px-[30px] py-2.5 text-center text-[16px]'

// 第1章クリア画面。
// 最終決戦への導線は CLAUDE.md の公開方針により v5 まで出さない
// (実装は移植済み。動作確認はデバッグメニューの章ジャンプ実装後にそちらから行う)
export function ClearScreen({ onTitle }: { onTitle: () => void }) {
  return (
    <div className="py-3.5 text-center">
      <h2 className="mb-4 text-[22px] font-normal text-patch">
        ★ 第1章 クリア! ★
      </h2>
      <Window className="mb-3.5 text-left text-[14px] leading-loose">
        今日おぼえた対策:
        <br />
        ・画面の覗き見(ショルダーハッキング)に注意
        <br />
        ・マルウェアにはワクチンスキャン
        <br />
        ・怪しいメールは送り主とURLを確認
      </Window>
      <Window className="mb-3.5 text-left text-[13px] leading-[1.9] text-sub">
        『2番目の門』——ウェブの街で、贈り物に化けた将軍が待ち受ける…。
        <br />
        つづきは本実装(第2章)で!
      </Window>
      <button className={bigBtnCls} onClick={onTitle}>
        ▶ タイトルへ もどる
      </button>
    </div>
  )
}
