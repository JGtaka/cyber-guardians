import { Window } from '../components/Window'

// 最終決戦(体験版)クリア後の「完」画面
export function FinaleScreen({ onTitle }: { onTitle: () => void }) {
  return (
    <div className="py-3.5 text-center">
      <h2 className="mb-4 text-[22px] font-normal text-weak">★ 完 ★</h2>
      <Window className="mb-3.5 text-left text-[14px] leading-loose">
        ゼロデイに勝つ、3つの備え:
        <br />
        ・多層防御で被害をおさえる(クローン展開)
        <br />
        ・修正プログラムをすぐ当てる(緊急パッチ適用)
        <br />
        ・記録して共有し、未知を既知にする(ミュートス)
      </Window>
      <Window className="mb-3.5 text-left text-[13px] leading-[1.9] text-sub">
        第2章〜第4章の物語、そしてここまでの旅は本実装で。
        <br />
        プレイありがとうございました!
      </Window>
      <button
        className="cursor-pointer rounded-[3px] border-4 border-white px-[30px] py-2.5 text-center text-[16px]"
        onClick={onTitle}
      >
        ▶ タイトルへ もどる
      </button>
    </div>
  )
}
