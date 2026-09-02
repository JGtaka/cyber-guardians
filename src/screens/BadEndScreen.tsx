import { useState } from 'react'
import { Window } from '../components/Window'
import { playSe } from '../game/sound'
import type { BadEnd, Enemy } from '../types'

const retryBtnCls =
  'w-full cursor-pointer rounded-[3px] border-4 border-white py-2.5 text-center text-[16px]'

// 敗北時のBAD ENDING画面(issue #24 / #23)。
// 「対策しなかった王国の末路」を1行ずつ見せてから、現実の事例と前向きな締めにつなぐ。
// 行送りは表示専用のためreducer外(既読の記録はretry時にreducerが行う)
export function BadEndScreen({
  enemy,
  badEnd,
  seen,
  disp,
  onRetry,
}: {
  enemy: Enemy
  badEnd: BadEnd
  seen: boolean // 既読ならスキップでそのままリトライできる
  disp: (t: string) => string
  onRetry: () => void
}) {
  const [si, setSi] = useState(0)
  const done = si >= badEnd.story.length - 1

  return (
    <div className="py-2">
      <p className="mb-1 text-center text-[22px] tracking-[0.2em] text-hp-enemy">
        ■ BAD ENDING ■
      </p>
      <p className="mb-4 text-center text-[14px] text-sub">
        —— {badEnd.title} ——
      </p>

      {/* 末路の物語(クリックで1行ずつ) */}
      <div
        className={`mb-3 min-h-[96px] ${done ? '' : 'cursor-pointer'}`}
        onClick={
          done
            ? undefined
            : () => {
                playSe('message')
                setSi(si + 1)
              }
        }
      >
        {badEnd.story.slice(0, si + 1).map((t, i) => (
          <p key={i} className="mb-2 text-[15px] leading-[1.9]">
            {disp(t)}
            {!done && i === si && (
              <span className="ml-2 inline-block animate-blink">
                ▼<span className="ml-1 text-[11px] text-sub">PUSH</span>
              </span>
            )}
          </p>
        ))}
      </div>

      {done ? (
        <>
          {/* げんじつファイル: 一次情報への出典リンク付き(教育コンテンツの品質ルール) */}
          <Window className="mb-3">
            <p className="mb-1.5 text-[13px] text-hp-enemy">
              ▣ げんじつファイル
            </p>
            <p className="mb-1.5 text-[13px] leading-[1.9]">{badEnd.genjitsu}</p>
            <a
              href={badEnd.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] text-mp underline"
            >
              {badEnd.source} ↗
            </a>
          </Window>
          <Window className="mb-3">
            <p className="text-[14px] leading-[1.9] text-patch">
              {disp(badEnd.lesson)}
            </p>
            {/* 対策スキルのヒントも並べて、リトライへの道筋を示す(魔王はヒントなし) */}
            {enemy.hint && (
              <p className="mt-1.5 text-[14px] leading-[1.9] text-patch">
                {disp(enemy.hint)}
              </p>
            )}
          </Window>
          <button className={retryBtnCls} onClick={onRetry}>
            ▶ もういちど いどむ(負けて覚えるのも対策です!)
          </button>
        </>
      ) : (
        seen && (
          <button
            className={`${retryBtnCls} text-sub`}
            onClick={onRetry}
          >
            ▶ スキップして もういちど いどむ
          </button>
        )
      )}
    </div>
  )
}
