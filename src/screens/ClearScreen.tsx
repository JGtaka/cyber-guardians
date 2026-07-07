import { Window } from '../components/Window'

export function ClearScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="py-4 text-center">
      <h2 className="mb-4 text-[22px] font-normal text-patch">
        ★ プロトタイプ クリア！ ★
      </h2>
      <Window className="mb-3.5 text-left text-[14px] leading-loose">
        きみが おぼえた たいさく:
        <br />
        ・マルウェアには ワクチンスキャン
        <br />
        ・あやしいメールは URLかくにん
        <br />
        ・パスワードには 二要素認証
      </Window>
      <Window className="mb-3.5 text-left text-[13px] leading-[1.9] text-sub">
        ここから先(章構成・図鑑・セーブ・ラスボスの多層防御戦)は
        これから拡張予定。
      </Window>
      <button
        className="cursor-pointer rounded-[3px] border-4 border-white px-[34px] py-2.5 text-[16px]"
        onClick={onRestart}
      >
        ▶ もういちど あそぶ
      </button>
    </div>
  )
}
