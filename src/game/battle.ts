import type { BattleEvent, Enemy, Skill } from '../types'
import { PLAYER_NAME } from '../data/constants'
import { randInt } from './random'

// バトル1ターン分のイベント列を生成する関数群。
// ここでは乱数でメッセージと fx(数値変化・演出)を組み立てるだけで、
// 状態の更新は reducer が各イベントの fx を適用して行う

// イベント生成に必要な現在ステータスのスナップショット
export interface BattleSnapshot {
  enemy: Enemy
  eHp: number
  pHp: number
  pMp: number
  fwTurns: number
  golemBonus: number
}

// 敵撃破時の締めイベントを追加する。撃破していれば true
function pushWinIfDefeated(
  events: BattleEvent[],
  enemy: Enemy,
  remainingEHp: number,
): boolean {
  if (remainingEHp > 0) return false
  events.push({ t: `${enemy.name}を たおした！`, fx: null })
  events.push({
    t: 'セキュリティ手帳に きろくされた！',
    fx: null,
    then: 'lesson',
  })
  return true
}

// 敵の反撃イベントを追加する
function pushEnemyTurn(
  events: BattleEvent[],
  snap: BattleSnapshot,
  defended: boolean,
) {
  const { enemy, fwTurns, golemBonus } = snap
  const half = defended || fwTurns > 0
  const cut = (d: number) => (half ? Math.ceil(d / 2) : d)
  let dmg: number
  if (enemy.id === 'slime') {
    dmg = cut(randInt(8, 12))
    events.push({ t: `${enemy.name}の たいあたり！`, fx: null })
    events.push({
      t: `${PLAYER_NAME}に ${dmg} のダメージ！`,
      fx: { pHp: -dmg, shake: true },
    })
  } else if (enemy.id === 'angler') {
    if (Math.random() < 0.35) {
      dmg = cut(6)
      events.push({
        t: `${enemy.name}は あやしいリンクを おくりつけた！`,
        fx: null,
      })
      events.push({
        t: `リソースを 8 うばわれた！ ${PLAYER_NAME}に ${dmg} のダメージ！`,
        fx: { pHp: -dmg, pMp: -8, shake: true },
      })
    } else {
      dmg = cut(randInt(10, 14))
      events.push({ t: `${enemy.name}の ニセメールこうげき！`, fx: null })
      events.push({
        t: `${PLAYER_NAME}に ${dmg} のダメージ！`,
        fx: { pHp: -dmg, shake: true },
      })
    }
  } else {
    dmg = cut(7 + golemBonus)
    events.push({
      t: `${enemy.name}の そうあたりアタック！(こうげきが あがっていく…)`,
      fx: { golem: 3 },
    })
    events.push({
      t: `${PLAYER_NAME}に ${dmg} のダメージ！`,
      fx: { pHp: -dmg, shake: true },
    })
  }
  if (half) {
    events.push({ t: 'ぼうぎょで ダメージを はんげんした！', fx: null })
  }
  // ファイアウォールの残りターンを表示なしで1減らす
  if (fwTurns > 0) {
    events.push({ t: '', fx: { fw: fwTurns - 1 }, skip: true })
  }
  if (snap.pHp - dmg <= 0) {
    events.push({
      t: `${PLAYER_NAME}は システムダウン してしまった…`,
      fx: null,
      then: 'gameover',
    })
  } else {
    events[events.length - 1].then = 'command'
  }
}

// コマンド「たたかう」
export function buildAttackEvents(snap: BattleSnapshot): BattleEvent[] {
  const dmg = randInt(11, 16)
  const events: BattleEvent[] = [
    { t: `${PLAYER_NAME}の こうげき！ デバッグソードの ひとふり！`, fx: null },
    {
      t: `${snap.enemy.name}に ${dmg} のダメージ！`,
      fx: { eHp: -dmg, eFlash: true },
    },
  ]
  if (!pushWinIfDefeated(events, snap.enemy, snap.eHp - dmg)) {
    pushEnemyTurn(events, snap, false)
  }
  return events
}

// コマンド「スキル」。弱点対策システムの本体
export function buildSkillEvents(
  snap: BattleSnapshot,
  skill: Skill,
): BattleEvent[] {
  const { enemy } = snap
  if (snap.pMp < skill.mp) {
    return [{ t: 'リソースが たりない！', fx: null, then: 'command' }]
  }
  const events: BattleEvent[] = []
  if (skill.type === 'buff') {
    events.push({
      t: `${PLAYER_NAME}は ファイアウォールを てんかいした！`,
      fx: { pMp: -skill.mp, fw: 3 },
    })
    events.push({
      t: 'しばらくのあいだ うけるダメージが はんげんする！',
      fx: null,
    })
    pushEnemyTurn(events, snap, false)
  } else if (skill.id === enemy.weak) {
    // 正解: WEAK POINT演出 + 大ダメージ
    const dmg = randInt(30, 38)
    events.push({ t: `${PLAYER_NAME}の ${skill.name}！`, fx: { pMp: -skill.mp } })
    events.push({
      t: '▶ WEAK POINT!! こうかは ばつぐんだ！',
      fx: { weak: true, eFlash: true },
    })
    events.push({
      t: `${enemy.name}に ${dmg} のダメージ！`,
      fx: { eHp: -dmg, eFlash: true },
    })
    if (!pushWinIfDefeated(events, enemy, snap.eHp - dmg)) {
      events.push({
        t: 'パッチ「それだ！ ただしい たいさくは さいきょうの ぶきだね！」',
        fx: null,
      })
      pushEnemyTurn(events, snap, false)
    }
  } else {
    // 不正解: 微ダメージ + パッチのヒント(MPのムダで学ぶ)
    const dmg = 5
    events.push({ t: `${PLAYER_NAME}の ${skill.name}！`, fx: { pMp: -skill.mp } })
    events.push({
      t: `…あまり きいていない。 ${enemy.name}に ${dmg} のダメージ。`,
      fx: { eHp: -dmg },
    })
    if (!pushWinIfDefeated(events, enemy, snap.eHp - dmg)) {
      events.push({ t: enemy.hint, fx: null })
      pushEnemyTurn(events, snap, false)
    }
  }
  return events
}

// コマンド「ぼうぎょ」
export function buildGuardEvents(snap: BattleSnapshot): BattleEvent[] {
  const events: BattleEvent[] = [
    {
      t: `${PLAYER_NAME}は みをまもっている。(リソースが 6 かいふく)`,
      fx: { pMp: 6 },
    },
  ]
  pushEnemyTurn(events, snap, true)
  return events
}
