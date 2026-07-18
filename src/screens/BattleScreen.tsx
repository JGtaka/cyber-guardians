import { Bar } from '../components/Bar'
import { MuteButton } from '../components/MuteButton'
import { Sprite } from '../components/Sprite'
import { Window } from '../components/Window'
import { SKILLS } from '../data/skills'
import { MAX_HP, MAX_MP } from '../data/constants'
import type { GameState } from '../game/reducer'
import type { Enemy, Menu, Skill } from '../types'

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
  onOpenMenu: (menu: Menu) => void
  onPatch: () => void // 魔王戦: 緊急パッチ適用
  onMythos: () => void // 魔王戦: 奥義ミュートス
  onRetry: () => void
}

// バトル画面(ゲームオーバー時のリトライ表示もここで扱う)
export function BattleScreen({
  state,
  enemy,
  eFlash,
  disp,
  onAdvance,
  onAttack,
  onGuard,
  onSkill,
  onOpenMenu,
  onPatch,
  onMythos,
  onRetry,
}: Props) {
  const inMsg = state.qi >= 0 && state.qi < state.queue.length
  const cur = inMsg ? state.queue[state.qi] : null
  const isMaou = enemy.id === 'maou'

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
            <span className="ml-2 inline-block animate-blink">▼</span>
          </span>
        ) : state.gameover ? (
          <span className="text-patch">{disp(enemy.hint)}</span>
        ) : (
          <span className="text-sub">コマンドを えらんでください</span>
        )}
      </Window>

      {/* コマンドウィンドウ */}
      {state.gameover ? (
        <Window>
          <button className={`${btnCls} w-full`} onClick={onRetry}>
            ▶ もういちど いどむ(負けて覚えるのも対策です!)
          </button>
        </Window>
      ) : !inMsg && isMaou && state.mPhase === 1 ? (
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
          <button className={`${btnCls} text-sub`} disabled>
            アイテム(未実装)
          </button>
        </Window>
      ) : !inMsg && state.menu === 'skill' ? (
        <Window>
          {SKILLS.map((sk) => {
            const isSealed = state.sealed === sk.id
            return (
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
          })}
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
