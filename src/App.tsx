import { useEffect, useReducer } from 'react'
import { ENEMIES } from './data/enemies'
import { CH2_FLOW_INDEX, CLEARS, STORIES } from './data/story'
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
import { useSoundFx } from './hooks/useSoundFx'
import { isMuted, playBgm, playSe } from './game/sound'
import { TitleScreen } from './screens/TitleScreen'
import { StoryScreen } from './screens/StoryScreen'
import { BattleScreen } from './screens/BattleScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ClearScreen } from './screens/ClearScreen'
import { FinaleScreen } from './screens/FinaleScreen'
import type { BgmId, EnemyId, Skill } from './types'

// 進行のうちセーブ対象(名前・章・図鑑解放・既読・ミュート)を書き出す
function persist(state: GameState) {
  writeSave({
    v: 1,
    name: state.name,
    chapter: state.chapter,
    zukan: state.zukan,
    seenStories: state.seenStories,
    muted: isMuted(),
  })
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createInitialState(loadSave()),
  )
  const { shake, weakFx, eFlash } = useVisualFx(state.queue, state.qi)
  useSoundFx(state.queue, state.qi)
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

  // シーンに応じたBGM。手帳(lesson)は勝利ジングルの続き→無音のまま切り替えない。
  // 魔王戦も当面 btl_boss(btl_final は v5 の最終章解禁まで使わない)
  const sceneBgm: BgmId | null = state.gameover
    ? 'jgl_gameover'
    : item.k === 'title'
      ? 'title'
      : item.k === 'story'
        ? 'daily'
        : item.k === 'battle'
          ? battleEnemy?.boss
            ? 'btl_boss'
            : 'btl_normal'
          : item.k === 'lesson'
            ? null
            : 'jgl_clear' // end / end2
  useEffect(() => {
    if (sceneBgm) playBgm(sceneBgm)
  }, [sceneBgm])

  const handleCommand = (kind: 'attack' | 'guard' | 'skill', skill?: Skill) => {
    if (!battleEnemy) return
    playSe('decide')
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
            onOpenNaming={() => {
              playSe('decide')
              dispatch({ type: 'openNaming' })
            }}
            onConfirm={(name) => {
              playSe('decide')
              dispatch({ type: 'confirmName', name })
            }}
            onContinue={
              state.chapter >= 1
                ? () => {
                    playSe('decide')
                    dispatch({ type: 'continueGame', fi: CH2_FLOW_INDEX })
                  }
                : undefined
            }
          />
        )}
        {item.k === 'story' && (
          <StoryScreen
            story={STORIES[item.id]}
            si={state.si}
            seen={state.seenStories.includes(item.id)}
            disp={disp}
            onAdvance={() => {
              playSe('message')
              dispatch({ type: 'advanceStory' })
            }}
            onSkip={() => {
              playSe('decide')
              dispatch({ type: 'skipStory' })
            }}
          />
        )}
        {item.k === 'battle' && battleEnemy && (
          <BattleScreen
            state={state}
            enemy={battleEnemy}
            eFlash={eFlash}
            disp={disp}
            onAdvance={() => {
              playSe('message')
              dispatch({ type: 'advance' })
            }}
            onAttack={() => handleCommand('attack')}
            onGuard={() => handleCommand('guard')}
            onSkill={(skill) => handleCommand('skill', skill)}
            onOpenMenu={(menu) => {
              playSe('cursor')
              dispatch({ type: 'setMenu', menu })
            }}
            onPatch={() => {
              playSe('decide')
              dispatch({ type: 'startQueue', events: buildPatchEvents() })
            }}
            onMythos={() => {
              playSe('decide')
              dispatch({ type: 'startQueue', events: buildMythosEvents() })
            }}
            onRetry={() => {
              playSe('continue')
              dispatch({ type: 'retry' })
            }}
          />
        )}
        {item.k === 'lesson' && (
          <ZukanLesson
            enemyId={item.e}
            onNext={() => {
              playSe('decide')
              dispatch({ type: 'enterFlow', fi: state.fi + 1 })
            }}
          />
        )}
        {item.k === 'end' && (
          <ClearScreen
            ch={item.ch}
            onNext={
              CLEARS[item.ch]?.hasNext
                ? () => {
                    playSe('decide')
                    dispatch({ type: 'enterFlow', fi: state.fi + 1 })
                  }
                : undefined
            }
            onTitle={() => {
              playSe('decide')
              dispatch({ type: 'toTitle' })
            }}
          />
        )}
        {item.k === 'end2' && (
          <FinaleScreen
            onTitle={() => {
              playSe('decide')
              dispatch({ type: 'toTitle' })
            }}
          />
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
