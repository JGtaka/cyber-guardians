import { useReducer } from 'react'
import { ENEMIES } from './data/enemies'
import { gameReducer, initialState } from './game/reducer'
import {
  buildAttackEvents,
  buildGuardEvents,
  buildSkillEvents,
  type BattleSnapshot,
} from './game/battle'
import { useVisualFx } from './hooks/useVisualFx'
import { TitleScreen } from './screens/TitleScreen'
import { BattleScreen } from './screens/BattleScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ClearScreen } from './screens/ClearScreen'
import type { Skill } from './types'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { shake, weakFx, eFlash } = useVisualFx(state.queue, state.qi)
  const enemy = ENEMIES[state.ei]

  // コマンド実行時点のステータスからイベント列を生成する
  const snapshot: BattleSnapshot = {
    enemy,
    eHp: state.eHp,
    pHp: state.pHp,
    pMp: state.pMp,
    fwTurns: state.fwTurns,
    golemBonus: state.golemBonus,
  }

  const handleSkill = (skill: Skill) => {
    dispatch({ type: 'setMenu', menu: 'main' })
    dispatch({ type: 'startQueue', events: buildSkillEvents(snapshot, skill) })
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-outer px-3 py-6">
      <div
        className={`relative w-full max-w-[520px] overflow-hidden rounded-md bg-screen px-[18px] py-5 font-dot text-ink ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {weakFx && (
          <div className="absolute inset-0 z-[5] flex animate-weak items-center justify-center bg-weak text-[26px] text-screen">
            WEAK POINT!!
          </div>
        )}

        {state.phase === 'title' && (
          <TitleScreen onStart={() => dispatch({ type: 'start' })} />
        )}
        {(state.phase === 'battle' || state.phase === 'gameover') && (
          <BattleScreen
            state={state}
            eFlash={eFlash}
            onAdvance={() => dispatch({ type: 'advance' })}
            onAttack={() =>
              dispatch({ type: 'startQueue', events: buildAttackEvents(snapshot) })
            }
            onGuard={() =>
              dispatch({ type: 'startQueue', events: buildGuardEvents(snapshot) })
            }
            onSkill={handleSkill}
            onOpenMenu={(menu) => dispatch({ type: 'setMenu', menu })}
            onRetry={() => dispatch({ type: 'retry' })}
          />
        )}
        {state.phase === 'lesson' && (
          <LessonScreen
            enemy={enemy}
            onNext={() => dispatch({ type: 'nextBattle' })}
          />
        )}
        {state.phase === 'clear' && (
          <ClearScreen onRestart={() => dispatch({ type: 'start' })} />
        )}
      </div>
    </div>
  )
}
