import { useState } from 'react'
import { MuteButton } from '../components/MuteButton'
import { Sprite } from '../components/Sprite'
import { Window } from '../components/Window'
import { DEFAULT_NAME, NAME_MAX_LEN } from '../data/constants'
import { sanitizeName } from '../game/save'

const bigBtnCls =
  'cursor-pointer rounded-[3px] border-4 border-white px-[30px] py-2.5 text-center text-[16px]'

// 名前入力ダイアログ。タイトルの上に重ねて表示する
function NamingDialog({
  savedName,
  onConfirm,
}: {
  savedName: string
  onConfirm: (name: string) => void
}) {
  // セーブ済みの名前があれば入力欄に引き継ぐ
  const [draft, setDraft] = useState(
    savedName === DEFAULT_NAME ? '' : savedName,
  )
  return (
    <div className="absolute inset-0 z-[6] flex flex-col justify-center bg-screen px-[22px] py-[30px]">
      <p className="mb-3.5 text-center text-[15px]">
        きみの なまえを おしえてください
      </p>
      <Window className="mb-3">
        <input
          value={draft}
          onChange={(e) =>
            // 空白不可・最大6文字(CLAUDE.md の確定仕様)
            setDraft(e.target.value.replace(/\s/g, '').slice(0, NAME_MAX_LEN))
          }
          placeholder={DEFAULT_NAME}
          className="box-border w-full border-none bg-transparent text-center text-[18px] text-ink outline-none placeholder:text-disabled"
        />
      </Window>
      <p className="mb-4 text-[12px] leading-[1.8] text-patch">
        クローンコード「6文字までです! それと、ネットの世界では本名を使わないのがおすすめですよ」
      </p>
      <button className={`${bigBtnCls} w-full`} onClick={() => onConfirm(sanitizeName(draft))}>
        ▶ けってい
      </button>
    </div>
  )
}

export function TitleScreen({
  naming,
  savedName,
  onOpenNaming,
  onConfirm,
  onContinue,
}: {
  naming: boolean
  savedName: string
  onOpenNaming: () => void
  onConfirm: (name: string) => void
  onContinue?: () => void // 章クリア済みセーブがあるときだけ渡される
}) {
  return (
    <div className="py-[26px] text-center">
      {/* 親フレーム(App)基準の右上。名前入力ダイアログ(z-6)より手前に置く */}
      <MuteButton className="absolute top-2 right-2 z-[7]" />
      <p className="text-[13px] text-sub">セキュリティ学習RPG(第1〜2章)</p>
      <h1 className="mt-2.5 mb-1 text-[26px] font-normal">
        サイバーガーディアンズ
      </h1>
      <p className="mb-5 text-[14px] text-patch">〜セキュリティ勇者の冒険〜</p>
      <div className="mb-5 flex items-end justify-center gap-[30px]">
        <Sprite id="slime" />
        <div className="animate-float">
          <Sprite id="fairy" />
        </div>
      </div>
      <Window className="mb-[18px] text-left text-[14px] leading-[1.9]">
        悪の攻撃には、必ず正しい「対策」がある。
        <br />
        スキルで敵の弱点を見抜いて倒そう!
      </Window>
      <div className="flex flex-col items-center gap-2.5">
        <button className={bigBtnCls} onClick={onOpenNaming}>
          ▶ ぼうけんに でる
        </button>
        {onContinue && (
          <button className={bigBtnCls} onClick={onContinue}>
            ▶ つづきから(第2章)
          </button>
        )}
      </div>
      {/* 魔王魂は素材利用にクレジット表記が必須(docs/sound.md・ASSETS.md) */}
      <p className="mt-5 text-[11px] text-sub">
        音楽・効果音:
        <a
          href="https://maou.audio/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          魔王魂
        </a>
      </p>
      {naming && <NamingDialog savedName={savedName} onConfirm={onConfirm} />}
    </div>
  )
}
