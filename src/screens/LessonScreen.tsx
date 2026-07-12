import { Window } from '../components/Window'
import type { ZukanEntry } from '../types'

// 撃破後のセキュリティ手帳(図鑑)画面。現実の攻撃と対策を解説する
export function LessonScreen({
  zukan,
  onNext,
}: {
  zukan: ZukanEntry
  onNext: () => void
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] text-sub">■ セキュリティ手帳</p>
      <Window className="mb-3">
        <p className="mb-2 text-[15px] text-patch">{zukan.no}</p>
        <p className="mb-2 text-[14px] leading-[1.9]">
          <span className="text-sub">正体:</span> {zukan.real}
        </p>
        <p className="text-[14px] leading-[1.9]">
          <span className="text-hp-player">対策:</span> {zukan.taisaku}
        </p>
      </Window>
      {/* げんじつファイル: 一次情報への出典リンク付き(教育コンテンツの品質ルール) */}
      <Window className="mb-3">
        <p className="mb-1.5 text-[13px] text-hp-enemy">▣ げんじつファイル</p>
        <p className="mb-1.5 text-[13px] leading-[1.9]">{zukan.genjitsu}</p>
        <a
          href={zukan.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] text-mp underline"
        >
          {zukan.source} ↗
        </a>
      </Window>
      <button
        className="w-full cursor-pointer rounded-[3px] border-4 border-white py-2.5 text-center text-[16px]"
        onClick={onNext}
      >
        ▶ つぎへ すすむ
      </button>
    </div>
  )
}
