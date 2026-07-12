import { useEffect, useReducer } from 'react'
import { ENEMIES } from './data/enemies'
import { STORIES } from './data/story'
import {
  createInitialState,
  flowItemAt,
  gameReducer,
  type GameState,
} from './game/reducer'
import { loadSave, writeSave } from './game/save'
import {
  buildAttackEvents,
  buildGuardEvents,
  buildMaouActEvents,
  buildMythosEvents,
  buildPatchEvents,
  buildSkillEvents,
  type BattleSnapshot,
} from './game/battle'
import { useVisualFx } from './hooks/useVisualFx'
import { TitleScreen } from './screens/TitleScreen'
import { StoryScreen } from './screens/StoryScreen'
import { BattleScreen } from './screens/BattleScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ClearScreen } from './screens/ClearScreen'
import { FinaleScreen } from './screens/FinaleScreen'
import type { EnemyId, Skill } from './types'

// 進行のうちセーブ対象(名前・章・図鑑解放・既読)を書き出す
function persist(state: GameState) {
  writeSave({
    v: 1,
    name: state.name,
    chapter: state.chapter,
    zukan: state.zukan,
    seenStories: state.seenStories,
  })
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createInitialState(loadSave()),
  )
  const { shake, weakFx, eFlash } = useVisualFx(state.queue, state.qi)
  const item = flowItemAt(state.fi)

  // テキスト中の {n} をプレイヤー名に差し込む(Reactの標準機構でエスケープされる)
  const disp = (t: string) => t.replaceAll('{n}', state.name)

  // 冒険開始後、進行が変わるたびにセーブする
  useEffect(() => {
    if (state.fi >= 0) persist(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fi, state.name, state.chapter, state.zukan, state.seenStories])

  // バトルコマンド: 現在ステータスのスナップショットからイベント列を生成する
  const battleEnemy = item.k === 'battle' ? ENEMIES[item.e] : null
  const inMaouScript = battleEnemy?.id === 'maou'

  const handleCommand = (kind: 'attack' | 'guard' | 'skill', skill?: Skill) => {
    if (!battleEnemy) return
    const snapshot: BattleSnapshot = {
      enemy: battleEnemy,
      eHp: state.eHp,
      pHp: state.pHp,
      pMp: state.pMp,
      fwTurns: state.fwTurns,
      mActs: state.mActs,
    }
    if (kind === 'skill') dispatch({ type: 'setMenu', menu: 'main' })
    const events = inMaouScript
      ? buildMaouActEvents(
          snapshot,
          kind === 'skill' ? { kind, name: skill!.name } : { kind },
        )
      : kind === 'attack'
        ? buildAttackEvents(snapshot)
        : kind === 'guard'
          ? buildGuardEvents(snapshot)
          : buildSkillEvents(snapshot, skill!)
    dispatch({ type: 'startQueue', events })
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

        {item.k === 'title' && (
          <TitleScreen
            naming={state.naming}
            savedName={state.name}
            onOpenNaming={() => dispatch({ type: 'openNaming' })}
            onConfirm={(name) => dispatch({ type: 'confirmName', name })}
          />
        )}
        {item.k === 'story' && (
          <StoryScreen
            story={STORIES[item.id]}
            si={state.si}
            seen={state.seenStories.includes(item.id)}
            disp={disp}
            onAdvance={() => dispatch({ type: 'advanceStory' })}
            onSkip={() => dispatch({ type: 'skipStory' })}
          />
        )}
        {item.k === 'battle' && battleEnemy && (
          <BattleScreen
            state={state}
            enemy={battleEnemy}
            eFlash={eFlash}
            disp={disp}
            onAdvance={() => dispatch({ type: 'advance' })}
            onAttack={() => handleCommand('attack')}
            onGuard={() => handleCommand('guard')}
            onSkill={(skill) => handleCommand('skill', skill)}
            onOpenMenu={(menu) => dispatch({ type: 'setMenu', menu })}
            onPatch={() =>
              dispatch({ type: 'startQueue', events: buildPatchEvents() })
            }
            onMythos={() =>
              dispatch({ type: 'startQueue', events: buildMythosEvents() })
            }
            onRetry={() => dispatch({ type: 'retry' })}
          />
        )}
        {item.k === 'lesson' && (
          <ZukanLesson
            enemyId={item.e}
            onNext={() => dispatch({ type: 'enterFlow', fi: state.fi + 1 })}
          />
        )}
        {item.k === 'end' && (
          <ClearScreen onTitle={() => dispatch({ type: 'toTitle' })} />
        )}
        {item.k === 'end2' && (
          <FinaleScreen onTitle={() => dispatch({ type: 'toTitle' })} />
        )}
      </div>
    </div>
  )
}

// zukan を持つ敵のみ手帳画面を出す(魔王は zukan なし)
function ZukanLesson({
  enemyId,
  onNext,
}: {
  enemyId: EnemyId
  onNext: () => void
}) {
  const zukan = ENEMIES[enemyId].zukan
  if (!zukan) return null
  return <LessonScreen zukan={zukan} onNext={onNext} />
}
