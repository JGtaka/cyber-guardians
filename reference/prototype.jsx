import { useState, useEffect } from "react";

// ===== サイバーガーディアンズ 第1章プロトタイプ(story.md v3準拠) =====

const P = {
  screen: "#14142b",
  text: "#f5f5ff",
  sub: "#aab4e8",
  patch: "#fac775",
  sig: "#5dcaa5",
  foe: "#e24b4a",
  mp: "#66aaee",
  weak: "#ffd74d",
};

const SPRITES = {
  slime: {
    px: 9,
    colors: { 1: "#5dcaa5", 0: "#14142b" },
    map: [
      "....1111....",
      "...111111...",
      "..11111111..",
      ".1111111111.",
      ".1100110011.",
      "111111111111",
      "111100001111",
      ".1111111111.",
      "..11111111..",
    ],
  },
  angler: {
    px: 10,
    colors: { 1: "#d4537e", 2: "#ffffff", 3: "#14142b", 4: "#fac775" },
    map: [
      "...4........",
      "...4........",
      "..111111....",
      ".11111111..1",
      "123111111.11",
      "111111111111",
      "111111111.11",
      ".11111111..1",
      "..111111....",
      ".1....1.....",
    ],
  },
  maou: {
    px: 9,
    colors: { 1: "#8a56c9", 4: "#fac775", 0: "#14142b" },
    map: [
      ".1........1.",
      ".11......11.",
      "..11111111..",
      ".1111111111.",
      "114411114411",
      "111111111111",
      ".1110000111.",
      ".1111111111.",
      "..11.11.11..",
      ".11..11..11.",
    ],
  },
  fairy: {
    px: 6,
    colors: { 4: "#fac775", 2: "#aab4e8", 0: "#14142b" },
    map: [
      ".2.....2.",
      "22.444.22",
      ".2444442.",
      "..40404..",
      "..44444..",
      "...444...",
      "...444...",
      "....4....",
    ],
  },
};

const SKILLS = [
  { id: "vaccine", name: "ワクチンスキャン", mp: 8, type: "attack" },
  { id: "url", name: "URLかくにん", mp: 8, type: "attack" },
  { id: "tfa", name: "二要素認証", mp: 8, type: "attack" },
  { id: "firewall", name: "ファイアウォール", mp: 10, type: "buff" },
];

const ENEMIES = {
  slime: {
    name: "ワームスライム",
    lv: 2,
    hp: 55,
    weak: "vaccine",
    boss: false,
    intro: ["ワームスライムが あらわれた!", "クローンコード「放っておくと分裂して増えるタイプです! 早めに倒しましょう!」"],
    hint: "クローンコード「マルウェアには、まずスキャン…じゃないでしょうか?」",
    zukan: {
      no: "No.001 ワーム",
      real: "ネットワークを通じて自分で自分をコピーして広がるマルウェア。",
      taisaku: "ウイルス対策ソフトの導入と定義ファイルの更新。怪しいファイルは開く前にスキャン。",
      genjitsu: "自己増殖するワームが世界中のコンピュータに感染を広げた事例が、過去に何度も報告されている。",
      source: "出典:IPA「情報セキュリティ10大脅威」",
      link: "https://www.ipa.go.jp/security/10threats/index.html",
    },
  },
  angler: {
    name: "フィッシング・アングラー",
    lv: 6,
    hp: 95,
    weak: "url",
    boss: true,
    intro: [
      "フィッシング・アングラーが たちふさがった!",
      "クローンコード「第1章のボスです! 手紙の見た目にだまされないでくださいね!」",
    ],
    hint: "クローンコード「偽物かどうか…どこを確かめるんでしたっけ?」",
    zukan: {
      no: "No.002 フィッシング詐欺",
      real: "実在の企業や組織をかたる偽メール・偽サイトで、パスワードやカード情報を盗む攻撃。",
      taisaku: "リンクを開く前に送り主とURLを確認。公式アプリやブックマークからアクセスする。",
      genjitsu: "実在の組織をかたる偽メールで感染を広げるマルウェア「Emotet」が、国内でも大流行した事例が報告されている。",
      source: "出典:JPCERT/CC「マルウエアEmotetへの対応FAQ」",
      link: "https://blogs.jpcert.or.jp/ja/2019/12/emotetfaq.html",
    },
  },
  maou: {
    name: "ゼロデイの魔王",
    lv: "??",
    hp: 999,
    weak: null,
    boss: true,
    intro: [
      "ゼロデイの魔王が しずかに こちらを見ている…",
      "クローンコード「気をつけて!『まだ誰も知らない弱点』から生まれた存在——どんな対策が通じるか、わたしにも分かりません!」",
    ],
    hint: "",
    zukan: null,
  },
};

const STORIES = {
  prologue: {
    title: "プロローグ:配属初日",
    lines: [
      { s: "", t: "——ここは ネット王国。たくさんの人々と、その大切な情報が暮らす電子の国。" },
      { s: "", t: "王国の暮らしは、すみずみまで張りめぐらされた『基幹システム』と、大切に守られた王国民の情報に支えられている。" },
      { s: "", t: "それらを日々の運用で守るのが、王国の縁の下の力持ち——「情報システム課」。" },
      { s: "", t: "きみ——{n}は今日、情報システム課に配属されたばかりの新米情シスだ。" },
      { s: "クローンコード", t: "はじめまして、{n}さん! わたしはサポートAI『クローンコード』。今日からあなたの相棒です!" },
      { s: "クローンコード", t: "長かったら『コード』と呼んでくださいね。あなたを一人前の情シスにするのが、わたしの任務です!" },
      { s: "{n}", t: "よ、よろしく。えっと、まずは課の端末に合言葉の登録…だっけ。" },
      { s: "{n}", t: "合言葉は…『{n}1234』っと。" },
      { s: "???", t: "ふむふむ…『{n}1234』ね。メモメモ…" },
      { s: "クローンコード", t: "後ろです、{n}さん! 覗かれてます!! …あっ、逃げられました…" },
      { s: "{n}", t: "い、今の何!?" },
      { s: "クローンコード", t: "ショルダーハッキング——画面や手元の覗き見です。ネットの中だけが攻撃じゃないんですよ。" },
      { s: "クローンコード", t: "…それと! 名前に数字を足しただけの合言葉は、すぐ推測されちゃいます! いずれ砦で勉強しましょうね。" },
      { s: "", t: "——ビーッ! ビーッ!(けたたましい警報)" },
      { s: "クローンコード", t: "大変です! 魔王軍がメールの森に侵攻しています! 行きましょう、{n}さん!" },
    ],
  },
  ch1_open: {
    title: "第1章:メールの森",
    lines: [
      { s: "クローンコード", t: "ここがメールの森です、{n}さん! 手紙を運ぶメールバードさんたちの住みかですよ。" },
      { s: "村人", t: "助けて〜! 『当選しました』って手紙についていったら、仲間が連れ去られたんだ!" },
      { s: "{n}", t: "当選…? 応募した覚え、あるのかな。" },
      { s: "クローンコード", t: "身に覚えのない当選は、怪しさ満点です! 森の奥へ行ってみましょう!" },
    ],
  },
  boss_pre: {
    title: "森の奥",
    lines: [
      { s: "アングラー", t: "ようこそ〜。キミにも特別なお知らせがあるんですよ〜。" },
      { s: "{n}", t: "この手紙、王国の紋章がついてる…本物?" },
      { s: "クローンコード", t: "待ってください! 紋章は偽れます。送り主をよく見て…って、わたしが見ます! …偽物です!" },
      { s: "アングラー", t: "ちっ…気づいたか。なら力ずくだ!" },
    ],
  },
  boss_post: {
    title: "第1章クリア",
    lines: [
      { s: "クローンコード", t: "偽メールは見た目じゃ見抜けません。送り主とリンク先、この2つが確認ポイントです!" },
      { s: "{n}", t: "怪しかったら、開く前に確認…だね。" },
      { s: "クローンコード", t: "それ、現実でも“あるある”なんですよ!" },
      { s: "クローンコード", t: "…ん? やつが落としたメモに『2番目の門へ』って書いてあります…。" },
    ],
  },
  final_pre: {
    title: "最終決戦プレビュー:クラウド天空城・最奥",
    lines: [
      { s: "", t: "——(体験版のため、物語は最終決戦まで一気に進む)" },
      { s: "", t: "クラウド天空城・最奥。基幹システムの中枢を前に、それは立っていた。" },
      { s: "魔王", t: "……ようこそ。ワタシは まだ 名を持たない。誰も知らぬ弱点から生まれた——ゼロデイの魔王。" },
      { s: "魔王", t: "この国の基幹システムも、王国民の情報も、すべてワタシのものになる。" },
      { s: "クローンコード", t: "させません! {n}さん、いきますよ——最後の戦いです!" },
    ],
  },
  ending: {
    title: "エピローグ",
    lines: [
      { s: "", t: "——魔王は消滅し、ネット王国に平和が戻った。" },
      { s: "クローンコード", t: "勝てたのは、備えていたからです! そして——記録して共有すれば、未知はもう未知じゃないんですよ。" },
      { s: "クローンコード", t: "{n}さん、もう立派な情シスですね!" },
      { s: "", t: "王国民の情報保管庫には、新しい錠前が二つ増えたという。——強いパスワードと、二要素認証。" },
    ],
  },
};

const FLOW = [
  { k: "story", id: "prologue" },
  { k: "story", id: "ch1_open" },
  { k: "battle", e: "slime" },
  { k: "lesson", e: "slime" },
  { k: "story", id: "boss_pre" },
  { k: "battle", e: "angler" },
  { k: "story", id: "boss_post" },
  { k: "lesson", e: "angler" },
  { k: "end" },
  { k: "story", id: "final_pre" },
  { k: "battle", e: "maou" },
  { k: "story", id: "ending" },
  { k: "end2" },
];

const MAX_HP = 100;
const MAX_MP = 50;
const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function Sprite({ id, flash, scale = 1 }) {
  const s = SPRITES[id];
  const px = s.px * scale;
  const shadows = [];
  s.map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (s.colors[ch]) shadows.push(`${x * px}px ${y * px}px 0 ${flash ? "#ffffff" : s.colors[ch]}`);
    });
  });
  return (
    <div style={{ width: s.map[0].length * px, height: s.map.length * px, position: "relative" }}>
      <div style={{ width: px, height: px, boxShadow: shadows.join(","), background: "transparent" }} />
    </div>
  );
}

function Bar({ value, max, color }) {
  return (
    <div style={{ border: "3px solid #fff", borderRadius: 2, padding: 2, width: "100%" }}>
      <div style={{ height: 8, width: `${Math.max(0, (value / max) * 100)}%`, background: color, transition: "width 0.3s steps(8)" }} />
    </div>
  );
}

const win = { border: "4px solid #fff", borderRadius: 3, padding: "10px 14px", background: P.screen };

const speakerColor = (s) =>
  s === "クローンコード" ? P.patch : s === "{n}" ? P.sig : s === "村人" ? P.mp : s === "" ? P.sub : P.foe;

export default function CyberGuardiansCh1() {
  const [name, setName] = useState("シグ");
  const [naming, setNaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const disp = (t) => t.replaceAll("{n}", name);
  const [fi, setFi] = useState(-1); // -1 = title
  const [si, setSi] = useState(0);
  const [eHp, setEHp] = useState(0);
  const [pHp, setPHp] = useState(MAX_HP);
  const [pMp, setPMp] = useState(MAX_MP);
  const [fwTurns, setFwTurns] = useState(0);
  const [menu, setMenu] = useState("main");
  const [queue, setQueue] = useState([]);
  const [qi, setQi] = useState(-1);
  const [gameover, setGameover] = useState(false);
  const [mPhase, setMPhase] = useState(0); // 魔王戦: 0=無敵 1=クローン展開後 2=弱点発生
  const [mActs, setMActs] = useState(0);
  const [shake, setShake] = useState(false);
  const [weakFx, setWeakFx] = useState(false);
  const [eFlash, setEFlash] = useState(false);

  const item = fi >= 0 ? FLOW[fi] : { k: "title" };
  const enemy = item.e ? ENEMIES[item.e] : null;
  const inMsg = qi >= 0 && qi < queue.length;
  const cur = inMsg ? queue[qi] : null;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DotGothic16&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  function applyFx(fx) {
    if (!fx) return;
    if (fx.eHp) setEHp((v) => Math.max(0, v + fx.eHp));
    if (fx.pHp) setPHp((v) => Math.max(0, Math.min(MAX_HP, v + fx.pHp)));
    if (fx.pMp) setPMp((v) => Math.max(0, Math.min(MAX_MP, v + fx.pMp)));
    if (fx.fw !== undefined) setFwTurns(fx.fw);
    if (fx.eFlash) { setEFlash(true); setTimeout(() => setEFlash(false), 220); }
    if (fx.shake) { setShake(true); setTimeout(() => setShake(false), 350); }
    if (fx.weak) { setWeakFx(true); setTimeout(() => setWeakFx(false), 650); }
    if (fx.mp2 !== undefined) setMPhase(fx.mp2);
  }

  function startQueue(events) {
    setQueue(events);
    setQi(0);
    applyFx(events[0].fx);
  }

  function enterFlow(n) {
    const it = FLOW[n];
    setFi(n);
    setSi(0);
    setGameover(false);
    if (it.k === "battle") {
      const e = ENEMIES[it.e];
      setEHp(e.hp);
      setFwTurns(0);
      setMenu("main");
      if (it.e === "maou") {
        setPHp(MAX_HP);
        setPMp(MAX_MP);
        setMPhase(0);
        setMActs(0);
      } else if (n > 2) { // 2戦目以降は小回復
        setPHp((v) => Math.min(MAX_HP, v + 25));
        setPMp((v) => Math.min(MAX_MP, v + 20));
      }
      setTimeout(() => startQueue(e.intro.map((t, i, a) => ({ t, fx: null, then: i === a.length - 1 ? "command" : undefined }))), 50);
    }
  }

  const advanceFlow = () => enterFlow(fi + 1);

  function advance() {
    const next = qi + 1;
    if (next < queue.length) {
      setQi(next);
      applyFx(queue[next].fx);
      return;
    }
    const end = queue[queue.length - 1].then || "command";
    setQueue([]);
    setQi(-1);
    if (end === "flow") advanceFlow();
    else if (end === "gameover") setGameover(true);
    else setMenu("main");
  }

  function enemyTurn(events, simPHp, defended) {
    const half = defended || fwTurns > 0;
    const cut = (d) => (half ? Math.ceil(d / 2) : d);
    let dmg;
    if (enemy === ENEMIES.slime) {
      dmg = cut(r(8, 12));
      events.push({ t: `${enemy.name}の たいあたり!`, fx: null });
      events.push({ t: `{n}に ${dmg} のダメージ!`, fx: { pHp: -dmg, shake: true } });
    } else if (Math.random() < 0.35) {
      dmg = cut(6);
      events.push({ t: `${enemy.name}は 怪しいリンクを送りつけた!`, fx: null });
      events.push({ t: `リソースを 8 うばわれた! {n}に ${dmg} のダメージ!`, fx: { pHp: -dmg, pMp: -8, shake: true } });
    } else {
      dmg = cut(r(10, 15));
      events.push({ t: `${enemy.name}の ニセメールこうげき!`, fx: null });
      events.push({ t: `{n}に ${dmg} のダメージ!`, fx: { pHp: -dmg, shake: true } });
    }
    simPHp -= dmg;
    if (half) events.push({ t: "防御で ダメージを半減した!", fx: null });
    if (fwTurns > 0) events.push({ t: "", fx: { fw: fwTurns - 1 }, skip: true });
    if (simPHp <= 0) events.push({ t: "{n}は システムダウンしてしまった…", fx: null, then: "gameover" });
    else events[events.length - 1].then = "command";
    return events.filter((e) => !e.skip || e.fx);
  }

  function checkWin(events, simEHp) {
    if (simEHp <= 0) {
      events.push({ t: `${enemy.name}を たおした!`, fx: null });
      events.push({ t: "セキュリティ手帳に きろくされた!", fx: null, then: "flow" });
      return true;
    }
    return false;
  }

  function doAttack() {
    const dmg = r(11, 16);
    const events = [
      { t: "{n}の こうげき! デバッグソードのひとふり!", fx: null },
      { t: `${enemy.name}に ${dmg} のダメージ!`, fx: { eHp: -dmg, eFlash: true } },
    ];
    if (!checkWin(events, eHp - dmg)) enemyTurn(events, pHp, false);
    startQueue(events);
  }

  function doSkill(sk) {
    if (pMp < sk.mp) {
      startQueue([{ t: "リソースが たりない!", fx: null, then: "command" }]);
      return;
    }
    const events = [];
    if (sk.type === "buff") {
      events.push({ t: "{n}は ファイアウォールを展開した!", fx: { pMp: -sk.mp, fw: 3 } });
      events.push({ t: "しばらくのあいだ 受けるダメージが半減する!", fx: null });
      enemyTurn(events, pHp, false);
    } else if (sk.id === enemy.weak) {
      const dmg = r(30, 38);
      events.push({ t: `{n}の ${sk.name}!`, fx: { pMp: -sk.mp } });
      events.push({ t: "▶ WEAK POINT!! こうかは ばつぐんだ!", fx: { weak: true, eFlash: true } });
      events.push({ t: `${enemy.name}に ${dmg} のダメージ!`, fx: { eHp: -dmg, eFlash: true } });
      if (!checkWin(events, eHp - dmg)) {
        events.push({ t: "クローンコード「それです! 正しい対策は最強の武器ですね!」", fx: null });
        enemyTurn(events, pHp, false);
      }
      startQueue(events);
      return;
    } else {
      const dmg = 5;
      events.push({ t: `{n}の ${sk.name}!`, fx: { pMp: -sk.mp } });
      events.push({ t: `…あまり効いていない。${enemy.name}に ${dmg} のダメージ。`, fx: { eHp: -dmg } });
      if (!checkWin(events, eHp - dmg)) {
        events.push({ t: "クローンコード「うーん、それじゃない気がします…」", fx: null });
        events.push({ t: enemy.hint, fx: null });
        enemyTurn(events, pHp, false);
      }
      startQueue(events);
      return;
    }
    startQueue(events);
  }

  function doGuard() {
    const events = [{ t: "{n}は 身を守っている。(リソースが 6 回復)", fx: { pMp: +6 } }];
    enemyTurn(events, pHp, true);
    startQueue(events);
  }

  function maouAct(kind) {
    if (mPhase === 0) {
      const label = kind === "attack" ? "こうげき" : kind;
      const events = [
        { t: `{n}の ${label}!`, fx: null },
        { t: "……効いていない!? 魔王には傷ひとつ ついていない!", fx: { eFlash: true } },
      ];
      const nActs = mActs + 1;
      setMActs(nActs);
      if (nActs >= 2) {
        events.push({ t: "クローンコード「どの対策も通じない…! 未知の攻撃だから、対策そのものが存在しないんです…!」", fx: null });
        events.push({ t: "クローンコード「……いえ。まだです。こんな時のために、わたしがいるんですから!」", fx: null });
        events.push({ t: "クローンコード「わたしの本当の力——クローン展開!!」", fx: { weak: true } });
        events.push({ t: "クローンコードが 無数に分身した! 分身たちが ファイアウォール・バックアップ・検知を同時に展開!", fx: { fw: 99 } });
        events.push({ t: "多層防御 完成——魔王の攻撃は もう届かない!", fx: null });
        events.push({ t: "クローンコード「今です{n}さん! 配布されたばかりの修正プログラムを——緊急パッチ適用を!!」", fx: { mp2: 1 }, then: "command" });
        startQueue(events);
        return;
      }
      const dmg = r(13, 17);
      events.push({ t: "魔王の 見えないこうげき!", fx: null });
      events.push({ t: `{n}に ${dmg} のダメージ!`, fx: { pHp: -dmg, shake: true }, then: "command" });
      startQueue(events);
      return;
    }
    if (kind === "patch") {
      startQueue([
        { t: `{n}の 緊急パッチ適用!!`, fx: null },
        { t: "魔王のからだに ひびが走る——『未知の弱点』が ふさがれ、姿が あらわになっていく!", fx: { weak: true, eFlash: true } },
        { t: "クローンコード「見えました! とどめです、{n}さん! やつの正体を——記録するんです!!」", fx: { mp2: 2 }, then: "command" },
      ]);
      return;
    }
    if (kind === "mythos") {
      startQueue([
        { t: "{n}は 魔王の正体を 解析した——動きのくせ、攻撃の型、生まれた場所。", fx: null },
        { t: "名もなき脅威に、名前を刻む——", fx: null },
        { t: "▶ 奥義 ミュートス!!", fx: { weak: true, eFlash: true } },
        { t: "セキュリティ手帳に『ゼロデイの魔王』が 記録された!", fx: { eHp: -999 } },
        { t: "未知は、既知の物語になった。——魔王は力を失い、消滅していく…!", fx: { eFlash: true } },
        { t: "クローンコード「勝ちました…! わたしたちの、備えの勝利です!!」", fx: null, then: "flow" },
      ]);
      return;
    }
    startQueue([{ t: "分身たちが守ってくれている。今のうちに——!", fx: null, then: "command" }]);
  }

  function retry() {
    setEHp(enemy.hp);
    setPHp(MAX_HP);
    setPMp(MAX_MP);
    setFwTurns(0);
    setGameover(false);
    setMenu("main");
    setTimeout(() => startQueue([{ t: `${enemy.name}に リベンジだ!`, fx: null, then: "command" }]), 50);
  }

  const font = { fontFamily: "'DotGothic16', 'Courier New', monospace" };
  const btn = { ...font, background: "transparent", border: "none", color: P.text, fontSize: 16, padding: "6px 4px", textAlign: "left", cursor: "pointer" };
  const bigBtn = { ...btn, border: "4px solid #fff", borderRadius: 3, padding: "10px 30px", textAlign: "center" };

  const story = item.k === "story" ? STORIES[item.id] : null;
  const line = story ? story.lines[si] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b1a", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 12px" }}>
      <style>{`
        @keyframes cgShake {0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes cgBlink {0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes cgWeak {0%{opacity:.9}100%{opacity:0}}
        @keyframes cgFloat {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      `}</style>

      <div style={{ ...font, background: P.screen, color: P.text, borderRadius: 6, padding: "20px 18px", width: "100%", maxWidth: 520, position: "relative", overflow: "hidden", animation: shake ? "cgShake .35s" : "none" }}>
        {weakFx && (
          <div style={{ position: "absolute", inset: 0, background: P.weak, opacity: 0.9, animation: "cgWeak .65s forwards", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", color: P.screen, fontSize: 26 }}>
            WEAK POINT!!
          </div>
        )}

        {item.k === "title" && (
          <div style={{ textAlign: "center", padding: "26px 0" }}>
            <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>セキュリティ学習RPG(第1章プロトタイプ)</p>
            <h1 style={{ fontSize: 26, margin: "10px 0 4px", fontWeight: 400 }}>サイバーガーディアンズ</h1>
            <p style={{ fontSize: 14, color: P.patch, margin: "0 0 20px" }}>〜セキュリティ勇者の冒険〜</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 30, alignItems: "flex-end", marginBottom: 20 }}>
              <Sprite id="slime" />
              <div style={{ animation: "cgFloat 2s infinite" }}><Sprite id="fairy" /></div>
            </div>
            <div style={{ ...win, textAlign: "left", fontSize: 14, lineHeight: 1.9, marginBottom: 18 }}>
              悪の攻撃には、必ず正しい「対策」がある。<br />
              スキルで敵の弱点を見抜いて倒そう!
            </div>
            <button style={bigBtn} onClick={() => { setNameDraft(""); setNaming(true); }}>▶ ぼうけんに でる</button>
          </div>
        )}

        {item.k === "title" && naming && (
          <div style={{ position: "absolute", inset: 0, background: P.screen, zIndex: 6, padding: "30px 22px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: 15, margin: "0 0 14px", textAlign: "center" }}>きみの なまえを おしえてください</p>
            <div style={{ ...win, marginBottom: 12 }}>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value.replace(/\s/g, "").slice(0, 6))}
                placeholder="シグ"
                style={{ ...font, width: "100%", background: "transparent", border: "none", outline: "none", color: P.text, fontSize: 18, textAlign: "center", boxSizing: "border-box" }}
              />
            </div>
            <p style={{ fontSize: 12, color: P.patch, lineHeight: 1.8, margin: "0 0 16px" }}>
              クローンコード「6文字までです! それと、ネットの世界では本名を使わないのがおすすめですよ」
            </p>
            <button style={{ ...bigBtn, width: "100%" }} onClick={() => { setName(nameDraft.trim() || "シグ"); setNaming(false); setPHp(MAX_HP); setPMp(MAX_MP); enterFlow(0); }}>
              ▶ けってい
            </button>
          </div>
        )}

        {item.k === "story" && line && (
          <div>
            <p style={{ fontSize: 13, color: P.sub, margin: "0 0 10px" }}>■ {story.title}</p>
            <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 20px", minHeight: 70 }}>
              {line.s === "クローンコード" ? (
                <div style={{ animation: "cgFloat 2s infinite" }}><Sprite id="fairy" /></div>
              ) : line.s === "アングラー" ? (
                <Sprite id="angler" scale={0.8} />
              ) : line.s === "魔王" ? (
                <Sprite id="maou" scale={0.8} />
              ) : (
                <div style={{ height: 48 }} />
              )}
            </div>
            <div style={{ ...win, minHeight: 100, cursor: "pointer", fontSize: 15, lineHeight: 1.9 }}
              onClick={() => (si + 1 < story.lines.length ? setSi(si + 1) : advanceFlow())}>
              {line.s !== "" && <p style={{ margin: "0 0 4px", fontSize: 13, color: speakerColor(line.s) }}>【{disp(line.s)}】</p>}
              <span style={{ color: line.s === "" ? P.sub : P.text }}>{disp(line.t)}</span>
              <span style={{ display: "inline-block", marginLeft: 8, animation: "cgBlink 1s infinite" }}>▼</span>
            </div>
            <p style={{ fontSize: 11, color: P.sub, textAlign: "right", margin: "8px 0 0" }}>クリックで つぎへ ({si + 1}/{story.lines.length})</p>
          </div>
        )}

        {item.k === "battle" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 15 }}>{enemy.boss ? "★ " : ""}{enemy.name}</span>
              <span style={{ fontSize: 13, color: P.sub }}>Lv.{enemy.lv}</span>
            </div>
            {item.e === "maou" && mPhase < 2 ? (
              <div style={{ border: "3px solid #fff", borderRadius: 2, padding: 2 }}>
                <div style={{ height: 8, textAlign: "center", fontSize: 10, lineHeight: "8px", color: P.sub }}>? ? ?</div>
              </div>
            ) : (
              <Bar value={eHp} max={enemy.hp} color={P.foe} />
            )}
            <div style={{ display: "flex", justifyContent: "center", padding: "18px 0 20px" }}>
              <Sprite id={item.e} flash={eFlash} />
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 10, fontSize: 13 }}>
              <span>{name}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: P.sig, width: 58 }}>稼働率</span>
                  <div style={{ flex: 1 }}><Bar value={pHp} max={MAX_HP} color={P.sig} /></div>
                  <span style={{ width: 56, textAlign: "right" }}>{pHp}/{MAX_HP}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ color: P.mp, width: 58 }}>リソース</span>
                  <div style={{ flex: 1 }}><Bar value={pMp} max={MAX_MP} color={P.mp} /></div>
                  <span style={{ width: 56, textAlign: "right" }}>{pMp}/{MAX_MP}</span>
                </div>
              </div>
            </div>
            {fwTurns > 0 && <p style={{ fontSize: 12, color: P.patch, margin: "0 0 8px" }}>◆ ファイアウォール展開中(のこり{fwTurns}ターン)</p>}

            <div style={{ ...win, minHeight: 76, marginBottom: 10, cursor: inMsg ? "pointer" : "default", fontSize: 15, lineHeight: 1.8 }} onClick={inMsg ? advance : undefined}>
              {inMsg ? (
                <span style={{ color: cur.t.startsWith("クローンコード") ? P.patch : P.text }}>
                  {disp(cur.t)}
                  <span style={{ display: "inline-block", marginLeft: 8, animation: "cgBlink 1s infinite" }}>▼</span>
                </span>
              ) : gameover ? (
                <span style={{ color: P.patch }}>{disp(enemy.hint)}</span>
              ) : (
                <span style={{ color: P.sub }}>コマンドを えらんでください</span>
              )}
            </div>

            {gameover ? (
              <div style={win}>
                <button style={{ ...btn, width: "100%" }} onClick={retry}>▶ もういちど いどむ(負けて覚えるのも対策です!)</button>
              </div>
            ) : !inMsg && item.e === "maou" && mPhase === 1 ? (
              <div style={win}>
                <button style={{ ...btn, width: "100%", color: P.patch, fontSize: 17 }} onClick={() => maouAct("patch")}>▶▶ 緊急パッチ適用!!</button>
              </div>
            ) : !inMsg && item.e === "maou" && mPhase === 2 ? (
              <div style={win}>
                <button style={{ ...btn, width: "100%", color: P.weak, fontSize: 17 }} onClick={() => maouAct("mythos")}>▶▶ 奥義 ミュートス!!</button>
              </div>
            ) : !inMsg && item.e === "maou" && menu === "main" ? (
              <div style={{ ...win, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 18px" }}>
                <button style={btn} onClick={() => maouAct("attack")}>▶ たたかう</button>
                <button style={btn} onClick={() => setMenu("skill")}>▶ スキル</button>
                <button style={btn} onClick={() => maouAct("guard")}>▶ ぼうぎょ</button>
                <button style={{ ...btn, color: P.sub }} disabled>アイテム(未実装)</button>
              </div>
            ) : !inMsg && item.e === "maou" && menu === "skill" ? (
              <div style={win}>
                {SKILLS.map((sk) => (
                  <button key={sk.id}
                    style={{ ...btn, display: "flex", justifyContent: "space-between", width: "100%" }}
                    onClick={() => { setMenu("main"); maouAct(sk.name); }}>
                    <span>▶ {sk.name}</span>
                    <span style={{ color: P.mp, fontSize: 13 }}>MP {sk.mp}</span>
                  </button>
                ))}
                <button style={{ ...btn, color: P.sub }} onClick={() => setMenu("main")}>もどる</button>
              </div>
            ) : !inMsg && menu === "main" ? (
              <div style={{ ...win, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 18px" }}>
                <button style={btn} onClick={doAttack}>▶ たたかう</button>
                <button style={btn} onClick={() => setMenu("skill")}>▶ スキル</button>
                <button style={btn} onClick={doGuard}>▶ ぼうぎょ</button>
                <button style={{ ...btn, color: P.sub }} disabled>アイテム(未実装)</button>
              </div>
            ) : !inMsg && menu === "skill" ? (
              <div style={win}>
                {SKILLS.map((sk) => (
                  <button key={sk.id}
                    style={{ ...btn, display: "flex", justifyContent: "space-between", width: "100%", color: pMp >= sk.mp ? P.text : "#666a8f" }}
                    onClick={() => { setMenu("main"); doSkill(sk); }}>
                    <span>▶ {sk.name}</span>
                    <span style={{ color: P.mp, fontSize: 13 }}>MP {sk.mp}</span>
                  </button>
                ))}
                <button style={{ ...btn, color: P.sub }} onClick={() => setMenu("main")}>もどる</button>
              </div>
            ) : null}
          </div>
        )}

        {item.k === "lesson" && (
          <div>
            <p style={{ fontSize: 13, color: P.sub, margin: "0 0 8px" }}>■ セキュリティ手帳</p>
            <div style={{ ...win, marginBottom: 12 }}>
              <p style={{ color: P.patch, fontSize: 15, margin: "0 0 8px" }}>{enemy.zukan.no}</p>
              <p style={{ fontSize: 14, lineHeight: 1.9, margin: "0 0 8px" }}>
                <span style={{ color: P.sub }}>正体:</span> {enemy.zukan.real}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.9, margin: 0 }}>
                <span style={{ color: P.sig }}>対策:</span> {enemy.zukan.taisaku}
              </p>
            </div>
            <div style={{ ...win, marginBottom: 12 }}>
              <p style={{ color: P.foe, fontSize: 13, margin: "0 0 6px" }}>▣ げんじつファイル</p>
              <p style={{ fontSize: 13, lineHeight: 1.9, margin: "0 0 6px" }}>{enemy.zukan.genjitsu}</p>
              <a href={enemy.zukan.link} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: P.mp, textDecoration: "underline", display: "inline-block" }}>
                {enemy.zukan.source} ↗
              </a>
            </div>
            <button style={{ ...bigBtn, width: "100%" }} onClick={advanceFlow}>▶ つぎへ すすむ</button>
          </div>
        )}

        {item.k === "end" && (
          <div style={{ textAlign: "center", padding: "14px 0" }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: P.patch, margin: "0 0 16px" }}>★ 第1章 クリア! ★</h2>
            <div style={{ ...win, textAlign: "left", fontSize: 14, lineHeight: 2, marginBottom: 14 }}>
              今日おぼえた対策:<br />
              ・画面の覗き見(ショルダーハッキング)に注意<br />
              ・マルウェアにはワクチンスキャン<br />
              ・怪しいメールは送り主とURLを確認
            </div>
            <div style={{ ...win, textAlign: "left", fontSize: 13, lineHeight: 1.9, color: P.sub, marginBottom: 14 }}>
              『2番目の門』——ウェブの街で、贈り物に化けた将軍が待ち受ける…。<br />
              つづきは本実装(第2章)で!
            </div>
            <button style={{ ...bigBtn, width: "100%", marginBottom: 10, color: P.weak }} onClick={() => enterFlow(9)}>▶ おまけ:最終決戦を体験する</button>
            <button style={bigBtn} onClick={() => setFi(-1)}>▶ タイトルへ もどる</button>
          </div>
        )}

        {item.k === "end2" && (
          <div style={{ textAlign: "center", padding: "14px 0" }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: P.weak, margin: "0 0 16px" }}>★ 完 ★</h2>
            <div style={{ ...win, textAlign: "left", fontSize: 14, lineHeight: 2, marginBottom: 14 }}>
              ゼロデイに勝つ、3つの備え:<br />
              ・多層防御で被害をおさえる(クローン展開)<br />
              ・修正プログラムをすぐ当てる(緊急パッチ適用)<br />
              ・記録して共有し、未知を既知にする(ミュートス)
            </div>
            <div style={{ ...win, textAlign: "left", fontSize: 13, lineHeight: 1.9, color: P.sub, marginBottom: 14 }}>
              第2章〜第4章の物語、そしてここまでの旅は本実装で。<br />
              プレイありがとうございました!
            </div>
            <button style={bigBtn} onClick={() => setFi(-1)}>▶ タイトルへ もどる</button>
          </div>
        )}
      </div>
    </div>
  );
}