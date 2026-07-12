import type { BattleEvent, Enemy, Skill } from '../types'
import { randInt } from './random'

// バトル1ターン分のイベント列を生成する関数群。
// ここでは乱数でメッセージと fx(数値変化・演出)を組み立てるだけで、
// 状態の更新は reducer が各イベントの fx を適用して行う。
// テキスト中の {n} は表示時にプレイヤー名へ差し込まれる

// イベント生成に必要な現在ステータスのスナップショット
export interface BattleSnapshot {
  enemy: Enemy
  eHp: number
  pHp: number
  pMp: number
  fwTurns: number
  mActs: number // 魔王戦・無敵段階での行動回数
}

// 敵撃破時の締めイベントを追加する。撃破していれば true
function pushWinIfDefeated(
  events: BattleEvent[],
  enemy: Enemy,
  remainingEHp: number,
): boolean {
  if (remainingEHp > 0) return false
  events.push({ t: `${enemy.name}を たおした!`, fx: null })
  events.push({
    t: 'セキュリティ手帳に きろくされた!',
    fx: null,
    then: 'flow',
  })
  return true
}

// 敵の反撃イベントを追加する
function pushEnemyTurn(
  events: BattleEvent[],
  snap: BattleSnapshot,
  defended: boolean,
) {
  const { enemy, fwTurns } = snap
  const half = defended || fwTurns > 0
  const cut = (d: number) => (half ? Math.ceil(d / 2) : d)
  let dmg: number
  if (enemy.id === 'slime') {
    dmg = cut(randInt(8, 12))
    events.push({ t: `${enemy.name}の たいあたり!`, fx: null })
    events.push({
      t: `{n}に ${dmg} のダメージ!`,
      fx: { pHp: -dmg, shake: true },
    })
  } else if (Math.random() < 0.35) {
    dmg = cut(6)
    events.push({ t: `${enemy.name}は 怪しいリンクを送りつけた!`, fx: null })
    events.push({
      t: `リソースを 8 うばわれた! {n}に ${dmg} のダメージ!`,
      fx: { pHp: -dmg, pMp: -8, shake: true },
    })
  } else {
    dmg = cut(randInt(10, 15))
    events.push({ t: `${enemy.name}の ニセメールこうげき!`, fx: null })
    events.push({
      t: `{n}に ${dmg} のダメージ!`,
      fx: { pHp: -dmg, shake: true },
    })
  }
  if (half) {
    events.push({ t: '防御で ダメージを半減した!', fx: null })
  }
  // ファイアウォールの残りターンを表示なしで1減らす
  if (fwTurns > 0) {
    events.push({ t: '', fx: { fw: fwTurns - 1 }, skip: true })
  }
  if (snap.pHp - dmg <= 0) {
    events.push({
      t: '{n}は システムダウンしてしまった…',
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
    { t: '{n}の こうげき! デバッグソードのひとふり!', fx: null },
    {
      t: `${snap.enemy.name}に ${dmg} のダメージ!`,
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
    return [{ t: 'リソースが たりない!', fx: null, then: 'command' }]
  }
  const events: BattleEvent[] = []
  if (skill.type === 'buff') {
    events.push({
      t: '{n}は ファイアウォールを展開した!',
      fx: { pMp: -skill.mp, fw: 3 },
    })
    events.push({
      t: 'しばらくのあいだ 受けるダメージが半減する!',
      fx: null,
    })
    pushEnemyTurn(events, snap, false)
  } else if (skill.id === enemy.weak) {
    // 正解: WEAK POINT演出 + 大ダメージ
    const dmg = randInt(30, 38)
    events.push({ t: `{n}の ${skill.name}!`, fx: { pMp: -skill.mp } })
    events.push({
      t: '▶ WEAK POINT!! こうかは ばつぐんだ!',
      fx: { weak: true, eFlash: true },
    })
    events.push({
      t: `${enemy.name}に ${dmg} のダメージ!`,
      fx: { eHp: -dmg, eFlash: true },
    })
    if (!pushWinIfDefeated(events, enemy, snap.eHp - dmg)) {
      events.push({
        t: 'クローンコード「それです! 正しい対策は最強の武器ですね!」',
        fx: null,
      })
      pushEnemyTurn(events, snap, false)
    }
  } else {
    // 不正解: 微ダメージ + 相棒のヒント(リソースのムダで学ぶ)
    const dmg = 5
    events.push({ t: `{n}の ${skill.name}!`, fx: { pMp: -skill.mp } })
    events.push({
      t: `…あまり効いていない。${enemy.name}に ${dmg} のダメージ。`,
      fx: { eHp: -dmg },
    })
    if (!pushWinIfDefeated(events, enemy, snap.eHp - dmg)) {
      events.push({
        t: 'クローンコード「うーん、それじゃない気がします…」',
        fx: null,
      })
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
      t: '{n}は 身を守っている。(リソースが 6 回復)',
      fx: { pMp: 6 },
    },
  ]
  pushEnemyTurn(events, snap, true)
  return events
}

// ===== 最終決戦(ゼロデイの魔王)のスクリプトバトル =====
// 段階0: 全スキル無効 → 2回行動でクローン展開(段階1)→ 緊急パッチ適用(段階2)→ 奥義ミュートス

export type MaouCommand =
  | { kind: 'attack' }
  | { kind: 'guard' }
  | { kind: 'skill'; name: string }

// 段階0(無敵)でのプレイヤー行動。何をしても通じない
export function buildMaouActEvents(
  snap: BattleSnapshot,
  cmd: MaouCommand,
): BattleEvent[] {
  const label =
    cmd.kind === 'attack' ? 'こうげき' : cmd.kind === 'guard' ? 'ぼうぎょ' : cmd.name
  const nActs = snap.mActs + 1
  const events: BattleEvent[] = [
    { t: `{n}の ${label}!`, fx: { mActs: nActs } },
    {
      t: '……効いていない!? 魔王には傷ひとつ ついていない!',
      fx: { eFlash: true },
    },
  ]
  if (nActs >= 2) {
    // クローン展開(名前の伏線回収)→ 多層防御で無敵化 → パッチ適用へ
    events.push({
      t: 'クローンコード「どの対策も通じない…! 未知の攻撃だから、対策そのものが存在しないんです…!」',
      fx: null,
    })
    events.push({
      t: 'クローンコード「……いえ。まだです。こんな時のために、わたしがいるんですから!」',
      fx: null,
    })
    events.push({
      t: 'クローンコード「わたしの本当の力——クローン展開!!」',
      fx: { weak: true },
    })
    events.push({
      t: 'クローンコードが 無数に分身した! 分身たちが ファイアウォール・バックアップ・検知を同時に展開!',
      fx: { fw: 99 },
    })
    events.push({ t: '多層防御 完成——魔王の攻撃は もう届かない!', fx: null })
    events.push({
      t: 'クローンコード「今です{n}さん! 配布されたばかりの修正プログラムを——緊急パッチ適用を!!」',
      fx: { mPhase: 1 },
      then: 'command',
    })
    return events
  }
  const dmg = randInt(13, 17)
  events.push({ t: '魔王の 見えないこうげき!', fx: null })
  events.push({
    t: `{n}に ${dmg} のダメージ!`,
    fx: { pHp: -dmg, shake: true },
    then: 'command',
  })
  return events
}

// 段階1: 緊急パッチ適用(弱点生成)
export function buildPatchEvents(): BattleEvent[] {
  return [
    { t: '{n}の 緊急パッチ適用!!', fx: null },
    {
      t: '魔王のからだに ひびが走る——『未知の弱点』が ふさがれ、姿が あらわになっていく!',
      fx: { weak: true, eFlash: true },
    },
    {
      t: 'クローンコード「見えました! とどめです、{n}さん! やつの正体を——記録するんです!!」',
      fx: { mPhase: 2 },
      then: 'command',
    },
  ]
}

// 段階2: 奥義ミュートス(解析・命名・記録=未知の既知化)
export function buildMythosEvents(): BattleEvent[] {
  return [
    {
      t: '{n}は 魔王の正体を 解析した——動きのくせ、攻撃の型、生まれた場所。',
      fx: null,
    },
    { t: '名もなき脅威に、名前を刻む——', fx: null },
    { t: '▶ 奥義 ミュートス!!', fx: { weak: true, eFlash: true } },
    {
      t: 'セキュリティ手帳に『ゼロデイの魔王』が 記録された!',
      fx: { eHp: -999 },
    },
    {
      t: '未知は、既知の物語になった。——魔王は力を失い、消滅していく…!',
      fx: { eFlash: true },
    },
    {
      t: 'クローンコード「勝ちました…! わたしたちの、備えの勝利です!!」',
      fx: null,
      then: 'flow',
    },
  ]
}
