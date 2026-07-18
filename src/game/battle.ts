import type { BattleEvent, Enemy, Skill, SkillId } from '../types'
import { SKILLS } from '../data/skills'
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
  eAtk: number // 敵の攻撃力ボーナス(ゴーレムの毎ターン上昇ギミック)
  psnTurns: number // まどわしの毒の残りターン(ウィッチのギミック)
  sealed: SkillId | null // 暗号化封印中のスキル(デーモンのギミック)
  mActs: number // 魔王戦・無敵段階での行動回数
}

// デーモンが暗号化封印の対象にできるスキル。
// バックアップだけは封印できない(=「バックアップは奪えない」の学びをメカニクスで表現)
const SEALABLE: SkillId[] = ['vaccine', 'url', 'scan', 'tfa', 'peek', 'call']

const skillName = (id: SkillId) => SKILLS.find((s) => s.id === id)?.name ?? id

// 敵撃破時の締めイベントを追加する。撃破していれば true
function pushWinIfDefeated(
  events: BattleEvent[],
  enemy: Enemy,
  remainingEHp: number,
): boolean {
  if (remainingEHp > 0) return false
  // 撃破の瞬間にバトルBGMを止めて勝利ジングルへ(鳴り終わると無音)
  events.push({ t: `${enemy.name}を たおした!`, fx: { win: true } })
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
  let halfMsgHandled = false // 半減表示を分岐内で済ませた(または不要=先読み貫通)
  if (enemy.id === 'witch') {
    // ギミック: 味方のふりをして毒を盛る(ソーシャルエンジニアリングの表現)
    if (snap.psnTurns === 0 && Math.random() < 0.4) {
      dmg = 0
      halfMsgHandled = true // この手番は攻撃しないので半減表示は不要
      events.push({
        t: `${enemy.name}は やさしく ほほえんだ。「お疲れでしょう? 回復のまじないを あげるわ」`,
        fx: null,
      })
      events.push({
        t: '…それは ニセの回復だった! {n}は まどわしの毒に おかされた!(毎ターンダメージ)',
        fx: { psn: 3, shake: true },
      })
    } else {
      dmg = cut(randInt(11, 15))
      events.push({ t: `${enemy.name}の こおりのつぶて!`, fx: null })
      events.push({
        t: `{n}に ${dmg} のダメージ!`,
        fx: { pHp: -dmg, shake: true },
      })
    }
  } else if (enemy.id === 'demon') {
    // ギミック: スキルを暗号化して封印(ランサムウェアの表現)。バックアップは封印できない
    if (snap.sealed === null && Math.random() < 0.45) {
      dmg = 0
      halfMsgHandled = true // この手番は攻撃しないので半減表示は不要
      const target = SEALABLE[randInt(0, SEALABLE.length - 1)]
      events.push({ t: `${enemy.name}の あんごうか こうげき!`, fx: null })
      events.push({
        t: `『${skillName(target)}』が 暗号化されて つかえなくなった! デーモン「返してほしくば 身代金を はらうんだな!」`,
        fx: { seal: target },
      })
      events.push({
        t: 'クローンコード「はらっちゃダメです! それに——バックアップだけは、絶対に暗号化できませんから!」',
        fx: null,
      })
    } else {
      dmg = cut(randInt(12, 16))
      events.push({ t: `${enemy.name}の こおりのかぎづめ!`, fx: null })
      events.push({
        t: `{n}に ${dmg} のダメージ!`,
        fx: { pHp: -dmg, shake: true },
      })
    }
  } else if (enemy.id === 'goblin') {
    // ギミック: 行動を先読みして、たまに防御をすりぬける(覗き見の怖さの表現)
    if (Math.random() < 0.3) {
      halfMsgHandled = true
      dmg = randInt(11, 15)
      events.push({
        t: `${enemy.name}は こちらの動きを 覗き見ていた!`,
        fx: null,
      })
      events.push({
        t: `先読みの一撃! ぼうぎょを すりぬけて {n}に ${dmg} のダメージ!`,
        fx: { pHp: -dmg, shake: true },
      })
    } else {
      dmg = cut(randInt(10, 14))
      events.push({ t: `${enemy.name}の ふいうち!`, fx: null })
      events.push({
        t: `{n}に ${dmg} のダメージ!`,
        fx: { pHp: -dmg, shake: true },
      })
    }
  } else if (enemy.id === 'golem') {
    // ギミック: 総当たりの勢いで毎ターン攻撃力が上がる(長期戦は不利=早く弱点を突く動機づけ)
    dmg = cut(randInt(9, 13) + snap.eAtk)
    events.push({ t: `${enemy.name}の こじあけこうげき!`, fx: null })
    events.push({
      t: `{n}に ${dmg} のダメージ!`,
      fx: { pHp: -dmg, shake: true },
    })
    // 半減表示は攻撃力上昇の口上より先に出す(メッセージの流れを守る)
    if (half) {
      events.push({ t: '防御で ダメージを半減した!', fx: null })
      halfMsgHandled = true
    }
    if (snap.eAtk < 8) {
      events.push({
        t: '総当たりの勢いが増していく…! ゴーレムの こうげきが 激しくなった!',
        fx: { eAtk: snap.eAtk + 2 },
      })
    }
  } else if (enemy.id === 'slime' || enemy.id === 'slime2') {
    dmg = cut(enemy.id === 'slime2' ? randInt(10, 14) : randInt(8, 12))
    events.push({ t: `${enemy.name}の たいあたり!`, fx: null })
    events.push({
      t: `{n}に ${dmg} のダメージ!`,
      fx: { pHp: -dmg, shake: true },
    })
  } else if (enemy.id === 'trojan') {
    if (Math.random() < 0.35) {
      dmg = cut(randInt(14, 18))
      events.push({
        t: `${enemy.name}は ニセの贈り物ばこを 投げつけた!`,
        fx: null,
      })
      events.push({
        t: `箱から ワナが とびだした! {n}に ${dmg} のダメージ!`,
        fx: { pHp: -dmg, shake: true },
      })
    } else {
      dmg = cut(randInt(12, 16))
      events.push({ t: `${enemy.name}の とっしん!`, fx: null })
      events.push({
        t: `{n}に ${dmg} のダメージ!`,
        fx: { pHp: -dmg, shake: true },
      })
    }
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
  if (half && !halfMsgHandled) {
    events.push({ t: '防御で ダメージを半減した!', fx: null })
  }
  // ファイアウォールの残りターンを表示なしで1減らす
  if (fwTurns > 0) {
    events.push({ t: '', fx: { fw: fwTurns - 1 }, skip: true })
  }
  // まどわしの毒の継続ダメージ(防御では減らせない)
  let psnDmg = 0
  if (snap.psnTurns > 0) {
    psnDmg = 4
    events.push({
      t: `まどわしの毒が {n}を むしばむ! ${psnDmg} のダメージ!`,
      fx: { pHp: -psnDmg, psn: snap.psnTurns - 1, shake: true },
    })
    if (snap.psnTurns - 1 === 0) {
      events.push({ t: 'まどわしの毒の 効果が切れた!', fx: null })
    }
  }
  if (snap.pHp - dmg - psnDmg <= 0) {
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
      fx: { eHp: -dmg, eFlash: true, se: 'attack' },
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
  if (skill.id === snap.sealed) {
    return [
      {
        t: `${skill.name}は 暗号化されていて つかえない! (バックアップなら 取り戻せるかも…)`,
        fx: null,
        then: 'command',
      },
    ]
  }
  if (snap.pMp < skill.mp) {
    return [{ t: 'リソースが たりない!', fx: null, then: 'command' }]
  }
  const events: BattleEvent[] = []
  if (skill.type === 'buff') {
    events.push({
      t: '{n}は ファイアウォールを展開した!',
      fx: { pMp: -skill.mp, fw: 3, se: 'skill' },
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
      // 弱点ヒットの音は直前の WEAK POINT(se_weak)に任せ、ここでは鳴らさない
      fx: { eHp: -dmg, eFlash: true },
    })
    if (!pushWinIfDefeated(events, enemy, snap.eHp - dmg)) {
      // デーモン戦: バックアップ(弱点)ヒットで暗号化されたスキルも復元する
      if (enemy.id === 'demon' && snap.sealed !== null) {
        events.push({
          t: `バックアップから復元! 暗号化されていた『${skillName(snap.sealed)}』が もとに戻った!`,
          fx: { seal: null },
        })
      }
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
      fx: { eHp: -dmg, se: 'skill' },
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
      fx: { eHp: -999, win: true },
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
