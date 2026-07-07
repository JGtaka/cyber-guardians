import { Bar } from '../components/Bar'
import { Sprite } from '../components/Sprite'
import { Window } from '../components/Window'
import { ENEMIES } from '../data/enemies'
import { SKILLS } from '../data/skills'
import { MAX_HP, MAX_MP } from '../data/constants'
import type { GameState } from '../game/reducer'
import type { Menu, Skill } from '../types'

const btnCls = 'cursor-pointer px-1 py-1.5 text-left text-[16px]'

interface Props {
  state: GameState
  eFlash: boolean
  onAdvance: () => void
  onAttack: () => void
  onGuard: () => void
  onSkill: (skill: Skill) => void
  onOpenMenu: (menu: Menu) => void
  onRetry: () => void
}

// バトル画面(ゲームオーバー時のリトライ表示もここで扱う)
export function BattleScreen({
  state,
  eFlash,
  onAdvance,
  onAttack,
  onGuard,
  onSkill,
  onOpenMenu,
  onRetry,
}: Props) {
  const enemy = ENEMIES[state.ei]
  const inMsg = state.qi >= 0 && state.qi < state.queue.length
  const cur = inMsg ? state.queue[state.qi] : null
  const isGameover = state.phase === 'gameover'

  return (
    <div>
      {/* 敵ステータス */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[15px]">{enemy.name}</span>
        <span className="text-[13px] text-sub">Lv.{enemy.lv}</span>
      </div>
      <Bar value={state.eHp} max={enemy.hp} colorClass="bg-hp-enemy" />

      <div className="flex justify-center pt-5 pb-[22px]">
        <Sprite id={enemy.id} flash={eFlash} />
      </div>

      {/* プレイヤーステータス */}
      <div className="mb-2.5 flex items-center gap-3.5 text-[13px]">
        <span>シグ</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-[60px] text-hp-player">稼働率</span>
            <div className="flex-1">
              <Bar value={state.pHp} max={MAX_HP} colorClass="bg-hp-player" />
            </div>
            <span className="w-[58px] text-right">
              {state.pHp}/{MAX_HP}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-[60px] text-mp">リソース</span>
            <div className="flex-1">
              <Bar value={state.pMp} max={MAX_MP} colorClass="bg-mp" />
            </div>
            <span className="w-[58px] text-right">
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

      {/* メッセージウィンドウ */}
      <Window
        className={`mb-2.5 min-h-[76px] text-[15px] leading-[1.8] ${
          inMsg ? 'cursor-pointer' : ''
        }`}
        onClick={inMsg ? onAdvance : undefined}
      >
        {cur ? (
          <span className={cur.t.startsWith('パッチ') ? 'text-patch' : ''}>
            {cur.t}
            <span className="ml-2 inline-block animate-blink">▼</span>
          </span>
        ) : isGameover ? (
          <span>{enemy.hint}</span>
        ) : (
          <span className="text-sub">コマンドを えらんでください</span>
        )}
      </Window>

      {/* コマンドウィンドウ */}
      {isGameover ? (
        <Window>
          <button className={`${btnCls} w-full`} onClick={onRetry}>
            ▶ もういちど いどむ(まけて おぼえる のも たいさく！)
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
          <button className={`${btnCls} text-sub`} disabled>
            アイテム(未実装)
          </button>
        </Window>
      ) : !inMsg && state.menu === 'skill' ? (
        <Window>
          {SKILLS.map((sk) => (
            <button
              key={sk.id}
              className={`${btnCls} flex w-full justify-between ${
                state.pMp >= sk.mp ? '' : 'text-disabled'
              }`}
              onClick={() => onSkill(sk)}
            >
              <span>▶ {sk.name}</span>
              <span className="text-[13px] text-mp">MP {sk.mp}</span>
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
