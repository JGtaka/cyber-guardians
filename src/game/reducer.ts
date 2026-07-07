import { ENEMIES } from '../data/enemies'
import { MAX_HP, MAX_MP } from '../data/constants'
import type { BattleEvent, Enemy, Fx, Menu, Phase } from '../types'

// ゲーム全体の状態遷移マシン。
// バトルの進行は BattleEvent のキューを1つずつ表示 → 各イベントの fx を適用、
// キューを消化し終えたら then(command / lesson / gameover)に従って遷移する

export interface GameState {
  phase: Phase
  ei: number // 現在の敵インデックス
  eHp: number
  pHp: number // 稼働率
  pMp: number // リソース
  fwTurns: number // ファイアウォールの残りターン
  golemBonus: number // ゴーレムの攻撃力上昇量
  menu: Menu
  queue: BattleEvent[]
  qi: number // 表示中イベントの位置(-1 = メッセージ非表示)
}

export type GameAction =
  | { type: 'start' } // タイトル/クリア画面から最初のバトルへ
  | { type: 'retry' } // ゲームオーバーから同じ敵に再挑戦
  | { type: 'nextBattle' } // 手帳画面から次の敵へ(最後なら clear)
  | { type: 'setMenu'; menu: Menu }
  | { type: 'startQueue'; events: BattleEvent[] }
  | { type: 'advance' } // メッセージ送り

export const initialState: GameState = {
  phase: 'title',
  ei: 0,
  eHp: ENEMIES[0].hp,
  pHp: MAX_HP,
  pMp: MAX_MP,
  fwTurns: 0,
  golemBonus: 0,
  menu: 'main',
  queue: [],
  qi: -1,
}

const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v))

// イベントの fx を状態に適用する(shake 等の表示演出は useVisualFx が担当)
function applyFx(s: GameState, fx?: Fx | null): GameState {
  if (!fx) return s
  return {
    ...s,
    eHp: fx.eHp ? Math.max(0, s.eHp + fx.eHp) : s.eHp,
    pHp: fx.pHp ? clamp(s.pHp + fx.pHp, MAX_HP) : s.pHp,
    pMp: fx.pMp ? clamp(s.pMp + fx.pMp, MAX_MP) : s.pMp,
    fwTurns: fx.fw ?? s.fwTurns,
    golemBonus: fx.golem ? s.golemBonus + fx.golem : s.golemBonus,
  }
}

// キューを消化し終えたときの遷移。行き先は最後のイベントの then で決まる
function finishQueue(s: GameState): GameState {
  const end = s.queue[s.queue.length - 1]?.then ?? 'command'
  const next: GameState = { ...s, queue: [], qi: -1 }
  if (end === 'lesson') return { ...next, phase: 'lesson' }
  if (end === 'gameover') return { ...next, phase: 'gameover' }
  return { ...next, menu: 'main' }
}

// キューの i 番目のイベントへ進んで fx を適用する。
// skip イベントは表示せず連続で処理し、末尾を越えたら finishQueue する
function stepTo(s: GameState, i: number): GameState {
  let cur = s
  while (i < cur.queue.length) {
    const ev = cur.queue[i]
    cur = applyFx({ ...cur, qi: i }, ev.fx)
    if (!ev.skip) return cur
    i++
  }
  return finishQueue(cur)
}

// 敵の登場口上をイベントキューに変換する
const introEvents = (enemy: Enemy): BattleEvent[] =>
  enemy.intro.map((t, i, a) => ({
    t,
    fx: null,
    then: i === a.length - 1 ? 'command' : undefined,
  }))

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      return stepTo(
        { ...initialState, phase: 'battle', queue: introEvents(ENEMIES[0]) },
        0,
      )
    case 'retry': {
      const enemy = ENEMIES[state.ei]
      return stepTo(
        {
          ...state,
          phase: 'battle',
          eHp: enemy.hp,
          pHp: MAX_HP,
          pMp: MAX_MP,
          fwTurns: 0,
          golemBonus: 0,
          menu: 'main',
          queue: [
            { t: `${enemy.name}に リベンジだ！`, fx: null, then: 'command' },
          ],
        },
        0,
      )
    }
    case 'nextBattle': {
      const ni = state.ei + 1
      if (ni >= ENEMIES.length) return { ...state, phase: 'clear' }
      return stepTo(
        {
          ...state,
          phase: 'battle',
          ei: ni,
          eHp: ENEMIES[ni].hp,
          // 章間の小休止: 稼働率とリソースを少し回復
          pHp: Math.min(MAX_HP, state.pHp + 25),
          pMp: Math.min(MAX_MP, state.pMp + 20),
          fwTurns: 0,
          golemBonus: 0,
          menu: 'main',
          queue: introEvents(ENEMIES[ni]),
        },
        0,
      )
    }
    case 'setMenu':
      return { ...state, menu: action.menu }
    case 'startQueue':
      return stepTo({ ...state, queue: action.events }, 0)
    case 'advance':
      if (state.qi < 0) return state
      return stepTo(state, state.qi + 1)
  }
}
