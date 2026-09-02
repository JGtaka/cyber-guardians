import { useEffect, useReducer, useState } from 'react'
import { BAD_ENDS, badEndIdOf } from './data/badend'
import { countZukan, ENEMIES, ZUKAN_TOTAL } from './data/enemies'
import {
  CHAPTER_STARTS,
  CLEARS,
  LAST_CHAPTER,
  STORIES,
  chapterLabelAt,
  resolveResumeFi,
} from './data/story'
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
import { BadEndScreen } from './screens/BadEndScreen'
import { BattleScreen } from './screens/BattleScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ZukanScreen } from './screens/ZukanScreen'
import { ClearScreen } from './screens/ClearScreen'
import { FinaleScreen } from './screens/FinaleScreen'
import type { BgmId, EnemyId, Skill } from './types'

// 進行のうちセーブ対象(名前・章・中断地点・図鑑解放・既読・ミュート)を書き出す
function persist(state: GameState) {
  writeSave({
    v: 1,
    name: state.name,
    chapter: state.chapter,
    fi: state.fi,
    zukan: state.zukan,
    seenStories: state.seenStories,
    seenBadEnds: state.seenBadEnds,
    muted: isMuted(),
  })
}

const confirmBtnCls =
  'cursor-pointer rounded-[3px] border-2 border-white px-3.5 py-1.5 text-[13px]'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createInitialState(loadSave()),
  )
  const { shake, weakFx, eFlash, recordFx } = useVisualFx(state.queue, state.qi)
  useSoundFx(state.queue, state.qi)
  const item = flowItemAt(state.fi)
  // セキュリティ手帳の閲覧画面(タイトルから開く。進行に影響しない表示専用の状態)
  const [zukanOpen, setZukanOpen] = useState(false)
  // 中断確認ダイアログ(会話・バトル中の「ちゅうだん」ボタンから開く)
  const [suspendConfirm, setSuspendConfirm] = useState(false)

  // テキスト中の {n} をプレイヤー名に差し込む(Reactの標準機構でエスケープされる)
  const disp = (t: string) => t.replaceAll('{n}', state.name)

  // 冒険開始後、進行が変わるたびにセーブする
  useEffect(() => {
    if (state.fi >= 0) persist(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.fi,
    state.name,
    state.chapter,
    state.zukan,
    state.seenStories,
    state.seenBadEnds,
  ])

  // バトルコマンド: 現在ステータスのスナップショットからイベント列を生成する
  const battleEnemy = item.k === 'battle' ? ENEMIES[item.e] : null
  const inMaouScript = battleEnemy?.id === 'maou'

  // シーンに応じたBGM。手帳(lesson)は獲得ジングル(jgl_clear)の続き→無音のまま切り替えない
  const sceneBgm: BgmId | null = state.gameover
    ? 'jgl_gameover'
    : item.k === 'title'
      ? 'title'
      : item.k === 'story'
        ? item.id === 'ending'
          ? 'ending' // 魔王戦後のエピローグはエンディング曲
          : 'daily'
        : item.k === 'battle'
          ? inMaouScript
            ? 'btl_final'
            : battleEnemy?.boss
              ? 'btl_boss'
              : 'btl_normal'
          : item.k === 'lesson'
            ? null
            : 'jgl_clear' // end / end2
  useEffect(() => {
    if (sceneBgm) playBgm(sceneBgm)
  }, [sceneBgm])

  // タイトルの「つづきから」: 中断地点があればそこへ、
  // なければ従来どおりクリア済みの次の章の頭へ(上限は実装済みの最新章)
  const resumeFi = resolveResumeFi(state.resumeFi)
  const fallbackChapter = Math.min(state.chapter + 1, LAST_CHAPTER)
  const continueFi = resumeFi >= 0 ? resumeFi : CHAPTER_STARTS[fallbackChapter]
  const continueLabel =
    resumeFi >= 0 ? chapterLabelAt(resumeFi) : `第${fallbackChapter}章`
  const canContinue = resumeFi >= 0 || state.chapter >= 1

  const handleCommand = (kind: 'attack' | 'guard' | 'skill', skill?: Skill) => {
    if (!battleEnemy) return
    playSe('decide')
    const snapshot: BattleSnapshot = {
      enemy: battleEnemy,
      eHp: state.eHp,
      pHp: state.pHp,
      pMp: state.pMp,
      fwTurns: state.fwTurns,
      eAtk: state.eAtk,
      psnTurns: state.psnTurns,
      sealed: state.sealed,
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
        {recordFx && (
          <div
            className="absolute inset-0 z-[5] flex cursor-pointer flex-col items-center justify-center gap-5 bg-outer/60"
            onClick={() => {
              playSe('message')
              dispatch({ type: 'advance' })
            }}
          >
            <div className="relative origin-left animate-record rounded-[3px] border-4 border-white bg-screen px-8 py-5 text-center">
              <p className="text-[13px] text-sub">▣ セキュリティ手帳</p>
              <p className="mt-1.5 text-[18px] text-patch">ページが ふえた!</p>
              <div className="absolute -top-4 -right-5 flex h-[64px] w-[64px] animate-stamp items-center justify-center rounded-full border-4 border-hp-enemy text-[13px] text-hp-enemy">
                きろく!
              </div>
            </div>
            <p className="inline-block animate-blink text-[14px]">
              ▼<span className="ml-1 text-[11px] text-sub">PUSH</span>
            </p>
          </div>
        )}

        {item.k === 'title' && zukanOpen && (
          <ZukanScreen
            zukanIds={state.zukan}
            zukanCount={countZukan(state.zukan)}
            zukanTotal={ZUKAN_TOTAL}
            onClose={() => {
              playSe('cursor')
              setZukanOpen(false)
            }}
          />
        )}
        {item.k === 'title' && !zukanOpen && (
          <TitleScreen
            naming={state.naming}
            savedName={state.name}
            zukanCount={countZukan(state.zukan)}
            zukanTotal={ZUKAN_TOTAL}
            onOpenNaming={() => {
              playSe('decide')
              dispatch({ type: 'openNaming' })
            }}
            onConfirm={(name) => {
              playSe('decide')
              dispatch({ type: 'confirmName', name })
            }}
            continueLabel={continueLabel}
            onContinue={
              canContinue
                ? () => {
                    playSe('decide')
                    dispatch({ type: 'continueGame', fi: continueFi })
                  }
                : undefined
            }
            onOpenZukan={() => {
              playSe('decide')
              setZukanOpen(true)
            }}
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
        {item.k === 'battle' && battleEnemy && state.gameover && (
          <BadEndScreen
            // 敵が替わったら行送りを最初からやり直す
            key={battleEnemy.id}
            enemy={battleEnemy}
            badEnd={BAD_ENDS[battleEnemy.id]}
            seen={state.seenBadEnds.includes(badEndIdOf(battleEnemy.id))}
            disp={disp}
            onRetry={() => {
              playSe('continue')
              dispatch({ type: 'retry' })
            }}
          />
        )}
        {item.k === 'battle' && battleEnemy && !state.gameover && (
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
          />
        )}
        {item.k === 'lesson' && (
          <ZukanLesson
            enemyId={item.e}
            count={countZukan(state.zukan)}
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
            name={state.name}
            zukanCount={countZukan(state.zukan)}
            zukanTotal={ZUKAN_TOTAL}
            onTitle={() => {
              playSe('decide')
              dispatch({ type: 'toTitle' })
            }}
          />
        )}

        {/* 会話・バトル中の中断ボタン(進行は自動セーブ済み。issue #16) */}
        {(item.k === 'story' || (item.k === 'battle' && !state.gameover)) && (
          <div className="mt-3 text-right">
            <button
              className="cursor-pointer text-[11px] text-sub underline"
              onClick={() => {
                playSe('cursor')
                setSuspendConfirm(true)
              }}
            >
              ▌▌ ちゅうだん
            </button>
          </div>
        )}
        {suspendConfirm && (
          <div className="absolute inset-0 z-[6] flex items-center justify-center bg-outer/60 px-5">
            <div className="w-full rounded-[3px] border-4 border-white bg-screen px-6 py-5 text-center">
              <p className="text-[15px] leading-[1.8]">
                ちゅうだんして タイトルに もどりますか?
              </p>
              <p className="mt-2 text-[12px] leading-[1.8] text-patch">
                すすみは じどうで きろくされています。
                {item.k === 'battle' &&
                  'バトルは つぎのとき さいしょから になります。'}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  className={confirmBtnCls}
                  onClick={() => {
                    playSe('decide')
                    setSuspendConfirm(false)
                    dispatch({ type: 'toTitle' })
                  }}
                >
                  ▶ タイトルへ もどる
                </button>
                <button
                  className={confirmBtnCls}
                  onClick={() => {
                    playSe('cursor')
                    setSuspendConfirm(false)
                  }}
                >
                  ▶ ぼうけんを つづける
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// zukan を持つ敵のみ手帳画面を出す(slime2 はエントリ共通のため zukan なし)
function ZukanLesson({
  enemyId,
  count,
  onNext,
}: {
  enemyId: EnemyId
  count: number
  onNext: () => void
}) {
  const zukan = ENEMIES[enemyId].zukan
  if (!zukan) return null
  return (
    <LessonScreen
      zukan={zukan}
      zukanCount={count}
      zukanTotal={ZUKAN_TOTAL}
      onNext={onNext}
    />
  )
}
