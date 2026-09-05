import { Bar } from '../components/Bar'
import { MuteButton } from '../components/MuteButton'
import { Sprite } from '../components/Sprite'
import { Window } from '../components/Window'
import { GIFT } from '../data/items'
import { LURE_SKILL, SKILLS } from '../data/skills'
import { MAX_HP, MAX_MP } from '../data/constants'
import type { GameState } from '../game/reducer'
import type { Enemy, Item, Menu, Skill } from '../types'

const btnCls = 'cursor-pointer px-1 py-1.5 text-left text-[16px]'

interface Props {
  state: GameState
  enemy: Enemy
  eFlash: boolean
  disp: (t: string) => string
  onAdvance: () => void
  onAttack: () => void
  onGuard: () => void
  onSkill: (skill: Skill) => void
  onLure: () => void // アングラー戦: ニセスキルを選んだ
  items: Item[] // 所持アイテム(会話で受け取ったもの)
  onItem: (item: Item) => void
  onGift: () => void // 木馬将軍戦: 贈り物を開けた
  onOpenMenu: (menu: Menu) => void
  onPatch: () => void // 魔王戦: 緊急パッチ適用
  onMythos: () => void // 魔王戦: 奥義ミュートス
}

// バトル画面(敗北後のBAD ENDINGはBadEndScreenが扱う)
export function BattleScreen({
  state,
  enemy,
  eFlash,
  disp,
  onAdvance,
  onAttack,
  onGuard,
  onSkill,
  onLure,
  items,
  onItem,
  onGift,
  onOpenMenu,
  onPatch,
  onMythos,
}: Props) {
  const inMsg = state.qi >= 0 && state.qi < state.queue.length
  const cur = inMsg ? state.queue[state.qi] : null
  const isMaou = enemy.id === 'maou'
  const hasGift = state.gift === 'held'

  return (
    <div>
      {/* 敵ステータス。魔王は正体が判明するまでHP不明 */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[15px]">
          {enemy.boss ? '★ ' : ''}
          {enemy.name}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[13px] text-sub">Lv.{enemy.lv}</span>
          <MuteButton />
        </span>
      </div>
      {isMaou && state.mPhase < 2 ? (
        <div className="rounded-[2px] border-[3px] border-white p-[2px]">
          <div className="h-2 text-center text-[10px] leading-2 text-sub">
            ? ? ?
          </div>
        </div>
      ) : (
        <Bar value={state.eHp} max={enemy.hp} colorClass="bg-hp-enemy" />
      )}

      <div className="flex justify-center pt-[18px] pb-5">
        <Sprite id={enemy.id} flash={eFlash} />
      </div>

      {/* プレイヤーステータス */}
      <div className="mb-2.5 flex items-center gap-3.5 text-[13px]">
        <span>{state.name}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-[58px] text-hp-player">稼働率</span>
            <div className="flex-1">
              <Bar value={state.pHp} max={MAX_HP} colorClass="bg-hp-player" />
            </div>
            <span className="w-[56px] text-right">
              {state.pHp}/{MAX_HP}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-[58px] text-mp">リソース</span>
            <div className="flex-1">
              <Bar value={state.pMp} max={MAX_MP} colorClass="bg-mp" />
            </div>
            <span className="w-[56px] text-right">
              {state.pMp}/{MAX_MP}
            </span>
          </div>
        </div>
      </div>
      {state.fwTurns > 0 && (
        <p className="mb-2 text-[12px] text-patch">
          ◆ ファイアウォール展開中(のこり{state.fwTurns}ターン)
        </p>
      )}
      {state.psnTurns > 0 && (
        <p className="mb-2 text-[12px] text-hp-enemy">
          ◆ まどわしの毒(のこり{state.psnTurns}ターン・毎ターン4ダメージ)
        </p>
      )}
      {state.lure && (
        <p className="mb-2 text-[12px] text-hp-enemy">
          ◆ あやしいお知らせを 受信中(スキル欄に 注意)
        </p>
      )}
      {enemy.id === 'goblin' && !state.filter && (
        <p className="mb-2 text-[12px] text-hp-enemy">
          ◆ 覗き見されている!(こうげきが かわされる)
        </p>
      )}
      {state.filter && (
        <p className="mb-2 text-[12px] text-patch">
          ◆ 覗き見防止フィルター展開中(覗き見を 無効化)
        </p>
      )}
      {hasGift && (
        <p className="mb-2 text-[12px] text-sub">
          ◆ 将軍の贈り物を 持っている(未開封・アイテム欄)
        </p>
      )}
      {state.gift === 'active' && (
        <p className="mb-2 text-[12px] text-hp-enemy">
          ◆ 体の中で なにかが うごめいている…
        </p>
      )}

      {/* メッセージウィンドウ */}
      <Window
        className={`mb-2.5 min-h-[76px] text-[15px] leading-[1.8] ${
          inMsg ? 'cursor-pointer' : ''
        }`}
        onClick={inMsg ? onAdvance : undefined}
      >
        {cur ? (
          <span
            className={cur.t.startsWith('クローンコード') ? 'text-patch' : ''}
          >
            {disp(cur.t)}
            <span className="ml-2 inline-block animate-blink">
              ▼<span className="ml-1 text-[11px] text-sub">PUSH</span>
            </span>
          </span>
        ) : (
          <span className="text-sub">コマンドを えらんでください</span>
        )}
      </Window>

      {/* コマンドウィンドウ */}
      {!inMsg && isMaou && state.mPhase === 1 ? (
        <Window>
          <button
            className={`${btnCls} w-full text-[17px] text-patch`}
            onClick={onPatch}
          >
            ▶▶ 緊急パッチ適用!!
          </button>
        </Window>
      ) : !inMsg && isMaou && state.mPhase === 2 ? (
        <Window>
          <button
            className={`${btnCls} w-full text-[17px] text-weak`}
            onClick={onMythos}
          >
            ▶▶ 奥義 ミュートス!!
          </button>
        </Window>
      ) : !inMsg && state.menu === 'main' ? (
        <Window className="grid grid-cols-2 gap-x-[18px] gap-y-[2px]">
          <button className={btnCls} onClick={onAttack}>
            ▶ たたかう
          </button>
          <button className={btnCls} onClick={() => onOpenMenu('skill')}>
            ▶ スキル
          </button>
          <button className={btnCls} onClick={onGuard}>
            ▶ ぼうぎょ
          </button>
          {items.length > 0 || hasGift ? (
            <button className={btnCls} onClick={() => onOpenMenu('item')}>
              ▶ アイテム
            </button>
          ) : (
            <button className={`${btnCls} text-sub`} disabled>
              アイテム(なし)
            </button>
          )}
        </Window>
      ) : !inMsg && state.menu === 'skill' ? (
        <Window>
          {SKILLS.map((sk) => {
            const isSealed = state.sealed === sk.id
            const btn = (
              <button
                key={sk.id}
                className={`${btnCls} flex w-full justify-between ${
                  isSealed || (!isMaou && state.pMp < sk.mp)
                    ? 'text-disabled'
                    : ''
                }`}
                onClick={() => onSkill(sk)}
              >
                <span>
                  ▶ {sk.name}
                  {isSealed && '(暗号化中)'}
                </span>
                <span className="text-[13px] text-mp">MP {sk.mp}</span>
              </button>
            )
            if (!state.lure || sk.id !== LURE_SKILL.mimics) return btn
            // ニセスキルは本物の真上に、本物と同じ見た目で並べる(見分けるのは名前の文字だけ)
            return [
              <button
                key="lure"
                className={`${btnCls} flex w-full justify-between ${
                  state.pMp < LURE_SKILL.mp ? 'text-disabled' : ''
                }`}
                onClick={onLure}
              >
                <span>▶ {LURE_SKILL.name}</span>
                <span className="text-[13px] text-mp">MP {LURE_SKILL.mp}</span>
              </button>,
              btn,
            ]
          })}
          <button
            className={`${btnCls} text-sub`}
            onClick={() => onOpenMenu('main')}
          >
            もどる
          </button>
        </Window>
      ) : !inMsg && state.menu === 'item' ? (
        <Window>
          {hasGift && (
            <button className={`${btnCls} w-full`} onClick={onGift}>
              <span className="block">▶ {GIFT.name}</span>
              <span className="block pl-5 text-[12px] text-sub">
                {GIFT.desc}
              </span>
            </button>
          )}
          {items.map((it) => (
            <button
              key={it.id}
              className={`${btnCls} w-full`}
              onClick={() => onItem(it)}
            >
              <span className="flex justify-between">
                <span>▶ {it.name}</span>
                {it.id === 'filter' && state.filter && (
                  <span className="text-[13px] text-patch">展開中</span>
                )}
              </span>
              <span className="block pl-5 text-[12px] text-sub">{it.desc}</span>
            </button>
          ))}
          <button
            className={`${btnCls} text-sub`}
            onClick={() => onOpenMenu('main')}
          >
            もどる
          </button>
        </Window>
      ) : null}
    </div>
  )
}
