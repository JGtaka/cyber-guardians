import { Sprite } from '../components/Sprite'
import { Window } from '../components/Window'
import type { Story } from '../types'

// 話者ごとのテキスト色(地の文はサブ色)
const speakerColorCls = (s: string) =>
  s === 'クローンコード'
    ? 'text-patch'
    : s === '{n}'
      ? 'text-hp-player'
      : s === '村人' || s === '店主' || s === '衛兵'
        ? 'text-mp'
        : s === ''
          ? 'text-sub'
          : 'text-hp-enemy'

// 話者に対応する立ち絵
function SpeakerSprite({ speaker }: { speaker: string }) {
  if (speaker === 'クローンコード') {
    return (
      <div className="animate-float">
        <Sprite id="fairy" />
      </div>
    )
  }
  if (speaker === 'アングラー') return <Sprite id="angler" scale={0.8} />
  if (speaker === '木馬将軍') return <Sprite id="trojan" scale={0.8} />
  if (speaker === 'ゴーレム') return <Sprite id="golem" scale={0.8} />
  if (speaker === '魔王') return <Sprite id="maou" scale={0.8} />
  return <div className="h-12" />
}

// 会話パート。クリックで1行ずつ送り、既読ならスキップできる
export function StoryScreen({
  story,
  si,
  seen,
  disp,
  onAdvance,
  onSkip,
}: {
  story: Story
  si: number
  seen: boolean // 既読(スキップ解放)
  disp: (t: string) => string
  onAdvance: () => void
  onSkip: () => void
}) {
  const line = story.lines[si]
  return (
    <div>
      <p className="mb-2.5 text-[13px] text-sub">■ {story.title}</p>
      <div className="flex min-h-[70px] justify-center pt-3.5 pb-5">
        <SpeakerSprite speaker={line.s} />
      </div>
      <Window
        className="min-h-[100px] cursor-pointer text-[15px] leading-[1.9]"
        onClick={onAdvance}
      >
        {line.s !== '' && (
          <p className={`mb-1 text-[13px] ${speakerColorCls(line.s)}`}>
            【{disp(line.s)}】
          </p>
        )}
        <span className={line.s === '' ? 'text-sub' : ''}>{disp(line.t)}</span>
        <span className="ml-2 inline-block animate-blink">▼</span>
      </Window>
      <div className="mt-2 flex items-center justify-between text-[11px] text-sub">
        {seen ? (
          <button className="cursor-pointer underline" onClick={onSkip}>
            ▶▶ スキップ(既読)
          </button>
        ) : (
          <span />
        )}
        <p>
          クリックで つぎへ ({si + 1}/{story.lines.length})
        </p>
      </div>
    </div>
  )
}
