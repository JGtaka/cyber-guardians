import { Window } from '../components/Window'
import type { Enemy } from '../types'

// 撃破後のセキュリティ手帳(図鑑)画面。現実の攻撃と対策を解説する
export function LessonScreen({
  enemy,
  onNext,
}: {
  enemy: Enemy
  onNext: () => void
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] text-sub">■ セキュリティ手帳</p>
      <Window className="mb-3">
        <p className="mb-2 text-[15px] text-patch">{enemy.zukan.no}</p>
        <p className="mb-2.5 text-[14px] leading-[1.9]">
          <span className="text-sub">正体:</span> {enemy.zukan.real}
        </p>
        <p className="text-[14px] leading-[1.9]">
          <span className="text-hp-player">対策:</span> {enemy.zukan.taisaku}
        </p>
      </Window>
      <Window className="mb-3 text-[14px] leading-[1.8] text-patch">
        パッチ「ゲームの スキルは、ぜんぶ げんじつでも つかえる たいさく
        なんだよ」
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
