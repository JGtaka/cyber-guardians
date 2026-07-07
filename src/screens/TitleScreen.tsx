import { Sprite } from '../components/Sprite'
import { Window } from '../components/Window'

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="py-7 text-center">
      <p className="text-[13px] text-sub">セキュリティ学習RPG(プロトタイプ)</p>
      <h1 className="mt-2.5 mb-1 text-[26px] font-normal">
        サイバーガーディアンズ
      </h1>
      <p className="mb-[22px] text-[14px] text-patch">
        〜セキュリティ勇者の冒険〜
      </p>
      <div className="mb-[22px] flex justify-center">
        <Sprite id="slime" />
      </div>
      <Window className="mb-[18px] text-left text-[14px] leading-[1.9]">
        あくの こうげきには かならず ただしい「たいさく」がある。
        <br />
        スキルで 敵の弱点を みぬいて たおそう！
      </Window>
      <button
        className="cursor-pointer rounded-[3px] border-4 border-white px-[34px] py-2.5 text-[18px]"
        onClick={onStart}
      >
        ▶ ぼうけんに でる
      </button>
    </div>
  )
}
