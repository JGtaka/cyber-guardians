import { ENEMIES } from '../data/enemies'
import { MAX_HP, MAX_MP } from '../data/constants'
import { FLOW, STORIES } from '../data/story'
import { emptySave, type SaveData } from './save'
import type {
  BattleEvent,
  Enemy,
  EnemyId,
  Fx,
  FlowItem,
  Menu,
  StoryId,
} from '../types'

// ゲーム全体の状態遷移マシン。
// 進行は FLOW(会話/バトル/手帳/クリア画面の列)を fi で指して進める。
// バトルは BattleEvent のキューを1つずつ表示 → 各イベントの fx を適用、
// キューを消化し終えたら then(command / flow / gameover)に従って遷移する

export interface GameState {
  name: string
  naming: boolean // 名前入力ダイアログ表示中
  fi: number // FLOW の現在位置(-1 = タイトル)
  si: number // 会話パートの行位置
  eHp: number
  pHp: number // 稼働率
  pMp: number // リソース
  fwTurns: number // ファイアウォールの残りターン
  mPhase: number // 魔王戦の段階: 0=無敵 1=クローン展開後 2=弱点発生
  mActs: number // 魔王戦・無敵段階での行動回数
  menu: Menu
  queue: BattleEvent[]
  qi: number // 表示中イベントの位置(-1 = メッセージ非表示)
  gameover: boolean
  // セーブ対象の進行記録
  chapter: number // クリア済みの章
  zukan: EnemyId[] // 図鑑の解放済み敵
  seenStories: StoryId[] // 会話の既読(スキップ解放用)
}

export type GameAction =
  | { type: 'openNaming' } // タイトル → 名前入力
  | { type: 'confirmName'; name: string } // 名前確定 → 冒険開始
  | { type: 'advanceStory' } // 会話を1行進める(最終行なら次のフローへ)
  | { type: 'skipStory' } // 既読の会話を最後まで飛ばす
  | { type: 'enterFlow'; fi: number } // 指定位置へジャンプ(最終決戦プレビュー等)
  | { type: 'continueGame'; fi: number } // タイトルの「つづきから」。全回復して指定位置へ
  | { type: 'toTitle' }
  | { type: 'retry' } // ゲームオーバーから同じ敵に再挑戦
  | { type: 'setMenu'; menu: Menu }
  | { type: 'startQueue'; events: BattleEvent[] }
  | { type: 'advance' } // メッセージ送り

export const flowItemAt = (fi: number): FlowItem | { k: 'title' } =>
  fi >= 0 && fi < FLOW.length ? FLOW[fi] : { k: 'title' }

// セーブデータからの初期状態(セーブなしなら emptySave を渡す)
export function createInitialState(save: SaveData | null): GameState {
  const s = save ?? emptySave
  return {
    name: s.name,
    naming: false,
    fi: -1,
    si: 0,
    eHp: 0,
    pHp: MAX_HP,
    pMp: MAX_MP,
    fwTurns: 0,
    mPhase: 0,
    mActs: 0,
    menu: 'main',
    queue: [],
    qi: -1,
    gameover: false,
    chapter: s.chapter,
    zukan: s.zukan,
    seenStories: s.seenStories,
  }
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
    mPhase: fx.mPhase ?? s.mPhase,
    mActs: fx.mActs ?? s.mActs,
  }
}

// 敵の登場口上をイベントキューに変換する
const introEvents = (enemy: Enemy): BattleEvent[] =>
  enemy.intro.map((t, i, a) => ({
    t,
    fx: null,
    then: i === a.length - 1 ? 'command' : undefined,
  }))

// FLOW の fi 番目に入る。バトルなら敵とキューを準備し、
// 手帳なら図鑑を解放、章クリア画面なら章を記録する
function enterFlow(s: GameState, fi: number): GameState {
  const item = flowItemAt(fi)
  let next: GameState = {
    ...s,
    fi,
    si: 0,
    gameover: false,
    queue: [],
    qi: -1,
  }
  if (item.k === 'battle') {
    const enemy = ENEMIES[item.e]
    next = { ...next, eHp: enemy.hp, fwTurns: 0, menu: 'main' }
    if (item.e === 'maou') {
      // 最終決戦は万全の状態で開始(スクリプトバトル)
      next = { ...next, pHp: MAX_HP, pMp: MAX_MP, mPhase: 0, mActs: 0 }
    } else if (fi > 2) {
      // 2戦目以降は章間の小休止として少し回復
      next = {
        ...next,
        pHp: Math.min(MAX_HP, next.pHp + 25),
        pMp: Math.min(MAX_MP, next.pMp + 20),
      }
    }
    return stepTo({ ...next, queue: introEvents(enemy) }, 0)
  }
  if (item.k === 'lesson') {
    // 撃破した敵をセキュリティ手帳(図鑑)に解放
    if (!next.zukan.includes(item.e)) {
      next = { ...next, zukan: [...next.zukan, item.e] }
    }
  }
  if (item.k === 'end') {
    next = { ...next, chapter: Math.max(next.chapter, item.ch) }
  }
  return next
}

// 会話を読み終えたときに既読として記録する
function markStorySeen(s: GameState): GameState {
  const item = flowItemAt(s.fi)
  if (item.k !== 'story' || s.seenStories.includes(item.id)) return s
  return { ...s, seenStories: [...s.seenStories, item.id] }
}

// キューを消化し終えたときの遷移。行き先は最後のイベントの then で決まる
function finishQueue(s: GameState): GameState {
  const end = s.queue[s.queue.length - 1]?.then ?? 'command'
  const next: GameState = { ...s, queue: [], qi: -1 }
  if (end === 'flow') return enterFlow(next, s.fi + 1)
  if (end === 'gameover') return { ...next, gameover: true }
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

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'openNaming':
      return { ...state, naming: true }
    case 'confirmName':
      return enterFlow(
        {
          ...state,
          name: action.name,
          naming: false,
          pHp: MAX_HP,
          pMp: MAX_MP,
        },
        0,
      )
    case 'advanceStory': {
      const item = flowItemAt(state.fi)
      if (item.k !== 'story') return state
      return state.si + 1 < STORIES[item.id].lines.length
        ? { ...state, si: state.si + 1 }
        : enterFlow(markStorySeen(state), state.fi + 1)
    }
    case 'skipStory': {
      const item = flowItemAt(state.fi)
      if (item.k !== 'story') return state
      return enterFlow(markStorySeen(state), state.fi + 1)
    }
    case 'enterFlow':
      return enterFlow(state, action.fi)
    case 'continueGame':
      return enterFlow({ ...state, pHp: MAX_HP, pMp: MAX_MP }, action.fi)
    case 'toTitle':
      return { ...state, fi: -1, si: 0, queue: [], qi: -1, gameover: false }
    case 'retry': {
      const item = flowItemAt(state.fi)
      if (item.k !== 'battle') return state
      const enemy = ENEMIES[item.e]
      return stepTo(
        {
          ...state,
          eHp: enemy.hp,
          pHp: MAX_HP,
          pMp: MAX_MP,
          fwTurns: 0,
          mPhase: 0,
          mActs: 0,
          gameover: false,
          menu: 'main',
          queue: [
            { t: `${enemy.name}に リベンジだ!`, fx: null, then: 'command' },
          ],
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
