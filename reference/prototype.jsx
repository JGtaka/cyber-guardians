import { useState, useEffect } from "react";

// ===== ゲームデータ(本実装ではJSONファイルに分離) =====

const PALETTE = {
  screen: "#14142b",
  text: "#f5f5ff",
  sub: "#aab4e8",
  patch: "#fac775",
  hpEnemy: "#e24b4a",
  hpPlayer: "#5dcaa5",
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
    px: 9,
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
  golem: {
    px: 9,
    colors: { 1: "#b4b2a9", 3: "#5f5e5a", 4: "#fac775" },
    map: [
      "..11111111..",
      ".1111111111.",
      "113311113311",
      "111111111111",
      ".1111441111.",
      ".1111441111.",
      "111111111111",
      "11.111111.11",
      "11.111111.11",
      "...111111...",
      "...11..11...",
      "..111..111..",
    ],
  },
};

const SKILLS = [
  { id: "vaccine", name: "ワクチンスキャン", mp: 8, type: "attack" },
  { id: "url", name: "URLかくにん", mp: 8, type: "attack" },
  { id: "tfa", name: "二要素認証", mp: 8, type: "attack" },
  { id: "firewall", name: "ファイアウォール", mp: 10, type: "buff" },
];

const ENEMIES = [
  {
    id: "slime",
    name: "ワームスライム",
    lv: 2,
    hp: 55,
    weak: "vaccine",
    intro: [
      "ワームスライムが あらわれた！",
      "パッチ「ほうっておくと ぶんれつして ふえるタイプだ！」",
    ],
    hint: "パッチ「マルウェアには、まず スキャン じゃないかな？」",
    zukan: {
      no: "No.001 ワーム",
      real: "ネットワークを通じて自分で自分をコピーして広がるマルウェア。",
      taisaku:
        "ウイルス対策ソフトの導入と定義ファイルの更新。怪しいファイルは開く前にスキャン。",
    },
  },
  {
    id: "angler",
    name: "フィッシング・アングラー",
    lv: 4,
    hp: 75,
    weak: "url",
    intro: [
      "フィッシング・アングラーが あらわれた！",
      "パッチ「ニセモノのメールで つりあげてくる やつだ！」",
    ],
    hint: "パッチ「ニセモノかどうか、どこを たしかめれば いいんだっけ？」",
    zukan: {
      no: "No.002 フィッシング詐欺",
      real: "実在の企業をかたる偽メールや偽サイトで、パスワードやカード情報を盗む攻撃。",
      taisaku:
        "リンクを踏む前にURLと送り主を確認。公式アプリやブックマークからアクセスする。",
    },
  },
  {
    id: "golem",
    name: "ブルートフォース・ゴーレム",
    lv: 7,
    hp: 100,
    weak: "tfa",
    intro: [
      "ブルートフォース・ゴーレムが あらわれた！",
      "パッチ「パスワードを そうあたりで ためしてくる！ ターンごとに つよくなるぞ！」",
    ],
    hint: "パッチ「パスワードだけに たよらない ほうほうが あったはず…」",
    zukan: {
      no: "No.003 ブルートフォース攻撃",
      real: "考えられるパスワードを片っ端から試してログインを突破しようとする攻撃。",
      taisaku:
        "長く複雑なパスワードと、二要素認証(2FA)の併用。使い回しをしない。",
    },
  },
];

const MAX_HP = 100;
const MAX_MP = 50;
const r = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// ===== ドット絵スプライト(box-shadow方式) =====

function Sprite({ id, flash }) {
  const s = SPRITES[id];
  const shadows = [];
  s.map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (s.colors[ch])
        shadows.push(
          `${x * s.px}px ${y * s.px}px 0 ${flash ? "#ffffff" : s.colors[ch]}`,
        );
    });
  });
  return (
    <div
      style={{
        width: s.map[0].length * s.px,
        height: s.map.length * s.px,
        position: "relative",
      }}
    >
      <div
        style={{
          width: s.px,
          height: s.px,
          boxShadow: shadows.join(","),
          background: "transparent",
        }}
      />
    </div>
  );
}

function Bar({ value, max, color, w }) {
  return (
    <div
      style={{
        border: "3px solid #fff",
        borderRadius: 2,
        padding: 2,
        width: w,
      }}
    >
      <div
        style={{
          height: 8,
          width: `${Math.max(0, (value / max) * 100)}%`,
          background: color,
          transition: "width 0.3s steps(8)",
        }}
      />
    </div>
  );
}

const winStyle = {
  border: "4px solid #fff",
  borderRadius: 3,
  padding: "10px 14px",
  background: PALETTE.screen,
};

// ===== 本体 =====

export default function CyberGuardians() {
  const [phase, setPhase] = useState("title"); // title | battle | lesson | clear | gameover
  const [ei, setEi] = useState(0);
  const [eHp, setEHp] = useState(ENEMIES[0].hp);
  const [pHp, setPHp] = useState(MAX_HP);
  const [pMp, setPMp] = useState(MAX_MP);
  const [fwTurns, setFwTurns] = useState(0);
  const [guarding, setGuarding] = useState(false);
  const [golemBonus, setGolemBonus] = useState(0);
  const [menu, setMenu] = useState("main"); // main | skill
  const [queue, setQueue] = useState([]);
  const [qi, setQi] = useState(-1);
  const [shake, setShake] = useState(false);
  const [weakFx, setWeakFx] = useState(false);
  const [eFlash, setEFlash] = useState(false);

  const enemy = ENEMIES[ei];
  const inMsg = qi >= 0 && qi < queue.length;
  const cur = inMsg ? queue[qi] : null;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DotGothic16&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  function applyFx(fx) {
    if (!fx) return;
    if (fx.eHp) setEHp((v) => Math.max(0, v + fx.eHp));
    if (fx.pHp) setPHp((v) => Math.max(0, Math.min(MAX_HP, v + fx.pHp)));
    if (fx.pMp) setPMp((v) => Math.max(0, Math.min(MAX_MP, v + fx.pMp)));
    if (fx.fw) setFwTurns(fx.fw);
    if (fx.golem) setGolemBonus((v) => v + fx.golem);
    if (fx.eFlash) {
      setEFlash(true);
      setTimeout(() => setEFlash(false), 220);
    }
    if (fx.shake) {
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
    if (fx.weak) {
      setWeakFx(true);
      setTimeout(() => setWeakFx(false), 650);
    }
  }

  function startQueue(events) {
    setQueue(events);
    setQi(0);
    applyFx(events[0].fx);
  }

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
    if (end === "lesson") setPhase("lesson");
    else if (end === "gameover") setPhase("gameover");
    else setMenu("main");
  }

  function enemyTurn(events, simPHp, simPMp, defended) {
    const half = defended || fwTurns > 0;
    const cut = (d) => (half ? Math.ceil(d / 2) : d);
    let dmg;
    if (enemy.id === "slime") {
      dmg = cut(r(8, 12));
      events.push({ t: `${enemy.name}の たいあたり！`, fx: null });
      events.push({
        t: `シグに ${dmg} のダメージ！`,
        fx: { pHp: -dmg, shake: true },
      });
    } else if (enemy.id === "angler") {
      if (Math.random() < 0.35) {
        dmg = cut(6);
        events.push({
          t: `${enemy.name}は あやしいリンクを おくりつけた！`,
          fx: null,
        });
        events.push({
          t: `リソースを 8 うばわれた！ シグに ${dmg} のダメージ！`,
          fx: { pHp: -dmg, pMp: -8, shake: true },
        });
        simPMp -= 8;
      } else {
        dmg = cut(r(10, 14));
        events.push({ t: `${enemy.name}の ニセメールこうげき！`, fx: null });
        events.push({
          t: `シグに ${dmg} のダメージ！`,
          fx: { pHp: -dmg, shake: true },
        });
      }
    } else {
      dmg = cut(7 + golemBonus);
      events.push({
        t: `${enemy.name}の そうあたりアタック！(こうげきが あがっていく…)`,
        fx: { golem: 3 },
      });
      events.push({
        t: `シグに ${dmg} のダメージ！`,
        fx: { pHp: -dmg, shake: true },
      });
    }
    simPHp -= dmg;
    if (half)
      events.push({ t: "ぼうぎょで ダメージを はんげんした！", fx: null });
    if (fwTurns > 0)
      events.push({ t: "", fx: { fw: fwTurns - 1 }, skip: true });
    if (simPHp <= 0) {
      events.push({
        t: "シグは システムダウン してしまった…",
        fx: null,
        then: "gameover",
      });
    } else {
      events[events.length - 1].then = "command";
    }
    return events.filter((e) => !e.skip || e.fx);
  }

  function checkWin(events, simEHp) {
    if (simEHp <= 0) {
      events.push({ t: `${enemy.name}を たおした！`, fx: null });
      events.push({
        t: "セキュリティ手帳に きろくされた！",
        fx: null,
        then: "lesson",
      });
      return true;
    }
    return false;
  }

  function doAttack() {
    const dmg = r(11, 16);
    const events = [
      { t: "シグの こうげき！ デバッグソードの ひとふり！", fx: null },
      {
        t: `${enemy.name}に ${dmg} のダメージ！`,
        fx: { eHp: -dmg, eFlash: true },
      },
    ];
    if (!checkWin(events, eHp - dmg)) enemyTurn(events, pHp, pMp, false);
    startQueue(events);
  }

  function doSkill(sk) {
    if (pMp < sk.mp) {
      startQueue([{ t: "リソースが たりない！", fx: null, then: "command" }]);
      return;
    }
    const events = [];
    if (sk.type === "buff") {
      events.push({
        t: "シグは ファイアウォールを てんかいした！",
        fx: { pMp: -sk.mp, fw: 3 },
      });
      events.push({
        t: "しばらくのあいだ うけるダメージが はんげんする！",
        fx: null,
      });
      enemyTurn(events, pHp, pMp - sk.mp, false);
    } else if (sk.id === enemy.weak) {
      const dmg = r(30, 38);
      events.push({ t: `シグの ${sk.name}！`, fx: { pMp: -sk.mp } });
      events.push({
        t: "▶ WEAK POINT!! こうかは ばつぐんだ！",
        fx: { weak: true, eFlash: true },
      });
      events.push({
        t: `${enemy.name}に ${dmg} のダメージ！`,
        fx: { eHp: -dmg, eFlash: true },
      });
      if (!checkWin(events, eHp - dmg)) {
        events.push({
          t: "パッチ「それだ！ ただしい たいさくは さいきょうの ぶきだね！」",
          fx: null,
        });
        enemyTurn(events, pHp, pMp - sk.mp, false);
      }
      startQueue(events);
      return;
    } else {
      const dmg = 5;
      events.push({ t: `シグの ${sk.name}！`, fx: { pMp: -sk.mp } });
      events.push({
        t: `…あまり きいていない。 ${enemy.name}に ${dmg} のダメージ。`,
        fx: { eHp: -dmg },
      });
      if (!checkWin(events, eHp - dmg)) {
        events.push({ t: enemy.hint, fx: null });
        enemyTurn(events, pHp, pMp - sk.mp, false);
      }
      startQueue(events);
      return;
    }
    startQueue(events);
  }

  function doGuard() {
    const events = [
      {
        t: "シグは みをまもっている。(リソースが 6 かいふく)",
        fx: { pMp: +6 },
      },
    ];
    enemyTurn(events, pHp, pMp, true);
    startQueue(events);
  }

  function nextBattle() {
    const ni = ei + 1;
    if (ni >= ENEMIES.length) {
      setPhase("clear");
      return;
    }
    setEi(ni);
    setEHp(ENEMIES[ni].hp);
    setPHp((v) => Math.min(MAX_HP, v + 25));
    setPMp((v) => Math.min(MAX_MP, v + 20));
    setFwTurns(0);
    setGolemBonus(0);
    setMenu("main");
    setPhase("battle");
    setTimeout(
      () =>
        startQueue(
          ENEMIES[ni].intro.map((t, i, a) => ({
            t,
            fx: null,
            then: i === a.length - 1 ? "command" : undefined,
          })),
        ),
      50,
    );
  }

  function startGame() {
    setEi(0);
    setEHp(ENEMIES[0].hp);
    setPHp(MAX_HP);
    setPMp(MAX_MP);
    setFwTurns(0);
    setGolemBonus(0);
    setMenu("main");
    setPhase("battle");
    setTimeout(
      () =>
        startQueue(
          ENEMIES[0].intro.map((t, i, a) => ({
            t,
            fx: null,
            then: i === a.length - 1 ? "command" : undefined,
          })),
        ),
      50,
    );
  }

  function retry() {
    setEHp(enemy.hp);
    setPHp(MAX_HP);
    setPMp(MAX_MP);
    setFwTurns(0);
    setGolemBonus(0);
    setMenu("main");
    setPhase("battle");
    setTimeout(
      () =>
        startQueue([
          { t: `${enemy.name}に リベンジだ！`, fx: null, then: "command" },
        ]),
      50,
    );
  }

  const font = { fontFamily: "'DotGothic16', 'Courier New', monospace" };
  const btn = {
    ...font,
    background: "transparent",
    border: "none",
    color: PALETTE.text,
    fontSize: 16,
    padding: "6px 4px",
    textAlign: "left",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b1a",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "24px 12px",
      }}
    >
      <style>{`
        @keyframes cgShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes cgBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes cgWeak { 0%{opacity:0.9} 100%{opacity:0} }
      `}</style>

      <div
        style={{
          ...font,
          background: PALETTE.screen,
          color: PALETTE.text,
          borderRadius: 6,
          padding: "20px 18px",
          width: "100%",
          maxWidth: 520,
          position: "relative",
          animation: shake ? "cgShake 0.35s" : "none",
          overflow: "hidden",
        }}
      >
        {weakFx && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: PALETTE.weak,
              opacity: 0.9,
              animation: "cgWeak 0.65s forwards",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#14142b",
              fontSize: 26,
            }}
          >
            WEAK POINT!!
          </div>
        )}

        {phase === "title" && (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <p style={{ fontSize: 13, color: PALETTE.sub, margin: 0 }}>
              セキュリティ学習RPG(プロトタイプ)
            </p>
            <h1
              style={{
                fontSize: 26,
                margin: "10px 0 4px",
                color: PALETTE.text,
                fontWeight: 400,
              }}
            >
              サイバーガーディアンズ
            </h1>
            <p
              style={{ fontSize: 14, color: PALETTE.patch, margin: "0 0 22px" }}
            >
              〜セキュリティ勇者の冒険〜
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 22,
              }}
            >
              <Sprite id="slime" />
            </div>
            <div
              style={{
                ...winStyle,
                textAlign: "left",
                fontSize: 14,
                lineHeight: 1.9,
                marginBottom: 18,
              }}
            >
              あくの こうげきには かならず ただしい「たいさく」がある。
              <br />
              スキルで 敵の弱点を みぬいて たおそう！
            </div>
            <button
              style={{
                ...btn,
                fontSize: 18,
                border: "4px solid #fff",
                borderRadius: 3,
                padding: "10px 34px",
              }}
              onClick={startGame}
            >
              ▶ ぼうけんに でる
            </button>
          </div>
        )}

        {(phase === "battle" || phase === "gameover") && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 15 }}>{enemy.name}</span>
              <span style={{ fontSize: 13, color: PALETTE.sub }}>
                Lv.{enemy.lv}
              </span>
            </div>
            <Bar value={eHp} max={enemy.hp} color={PALETTE.hpEnemy} w="100%" />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px 0 22px",
              }}
            >
              <Sprite id={enemy.id} flash={eFlash} />
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              <span>シグ</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: PALETTE.hpPlayer, width: 60 }}>
                    稼働率
                  </span>
                  <div style={{ flex: 1 }}>
                    <Bar
                      value={pHp}
                      max={MAX_HP}
                      color={PALETTE.hpPlayer}
                      w="100%"
                    />
                  </div>
                  <span style={{ width: 58, textAlign: "right" }}>
                    {pHp}/{MAX_HP}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <span style={{ color: PALETTE.mp, width: 60 }}>リソース</span>
                  <div style={{ flex: 1 }}>
                    <Bar value={pMp} max={MAX_MP} color={PALETTE.mp} w="100%" />
                  </div>
                  <span style={{ width: 58, textAlign: "right" }}>
                    {pMp}/{MAX_MP}
                  </span>
                </div>
              </div>
            </div>
            {fwTurns > 0 && (
              <p
                style={{
                  fontSize: 12,
                  color: PALETTE.patch,
                  margin: "0 0 8px",
                }}
              >
                ◆ ファイアウォール展開中(のこり{fwTurns}ターン)
              </p>
            )}

            <div
              style={{
                ...winStyle,
                minHeight: 76,
                marginBottom: 10,
                cursor: inMsg ? "pointer" : "default",
                fontSize: 15,
                lineHeight: 1.8,
              }}
              onClick={inMsg ? advance : undefined}
            >
              {inMsg ? (
                <span
                  style={{
                    color: cur.t.startsWith("パッチ")
                      ? PALETTE.patch
                      : PALETTE.text,
                  }}
                >
                  {cur.t}
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: 8,
                      animation: "cgBlink 1s infinite",
                    }}
                  >
                    ▼
                  </span>
                </span>
              ) : phase === "gameover" ? (
                <span>{enemy.hint}</span>
              ) : (
                <span style={{ color: PALETTE.sub }}>
                  コマンドを えらんでください
                </span>
              )}
            </div>

            {phase === "gameover" ? (
              <div style={{ ...winStyle }}>
                <button style={{ ...btn, width: "100%" }} onClick={retry}>
                  ▶ もういちど いどむ(まけて おぼえる のも たいさく！)
                </button>
              </div>
            ) : !inMsg && menu === "main" ? (
              <div
                style={{
                  ...winStyle,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2px 18px",
                }}
              >
                <button style={btn} onClick={doAttack}>
                  ▶ たたかう
                </button>
                <button style={btn} onClick={() => setMenu("skill")}>
                  ▶ スキル
                </button>
                <button style={btn} onClick={doGuard}>
                  ▶ ぼうぎょ
                </button>
                <button style={{ ...btn, color: PALETTE.sub }} disabled>
                  アイテム(未実装)
                </button>
              </div>
            ) : !inMsg && menu === "skill" ? (
              <div style={{ ...winStyle }}>
                {SKILLS.map((sk) => (
                  <button
                    key={sk.id}
                    style={{
                      ...btn,
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      color: pMp >= sk.mp ? PALETTE.text : "#666a8f",
                    }}
                    onClick={() => {
                      setMenu("main");
                      doSkill(sk);
                    }}
                  >
                    <span>▶ {sk.name}</span>
                    <span style={{ color: PALETTE.mp, fontSize: 13 }}>
                      MP {sk.mp}
                    </span>
                  </button>
                ))}
                <button
                  style={{ ...btn, color: PALETTE.sub }}
                  onClick={() => setMenu("main")}
                >
                  もどる
                </button>
              </div>
            ) : null}
          </div>
        )}

        {phase === "lesson" && (
          <div>
            <p style={{ fontSize: 13, color: PALETTE.sub, margin: "0 0 8px" }}>
              ■ セキュリティ手帳
            </p>
            <div style={{ ...winStyle, marginBottom: 12 }}>
              <p
                style={{
                  color: PALETTE.patch,
                  fontSize: 15,
                  margin: "0 0 8px",
                }}
              >
                {enemy.zukan.no}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.9, margin: "0 0 10px" }}>
                <span style={{ color: PALETTE.sub }}>正体:</span>{" "}
                {enemy.zukan.real}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.9, margin: 0 }}>
                <span style={{ color: PALETTE.hpPlayer }}>対策:</span>{" "}
                {enemy.zukan.taisaku}
              </p>
            </div>
            <div
              style={{
                ...winStyle,
                marginBottom: 12,
                fontSize: 14,
                lineHeight: 1.8,
                color: PALETTE.patch,
              }}
            >
              パッチ「ゲームの スキルは、ぜんぶ げんじつでも つかえる たいさく
              なんだよ」
            </div>
            <button
              style={{
                ...btn,
                border: "4px solid #fff",
                borderRadius: 3,
                width: "100%",
                textAlign: "center",
                padding: "10px 0",
              }}
              onClick={nextBattle}
            >
              ▶ つぎへ すすむ
            </button>
          </div>
        )}

        {phase === "clear" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: PALETTE.patch,
                margin: "0 0 16px",
              }}
            >
              ★ プロトタイプ クリア！ ★
            </h2>
            <div
              style={{
                ...winStyle,
                textAlign: "left",
                fontSize: 14,
                lineHeight: 2,
                marginBottom: 14,
              }}
            >
              きみが おぼえた たいさく:
              <br />
              ・マルウェアには ワクチンスキャン
              <br />
              ・あやしいメールは URLかくにん
              <br />
              ・パスワードには 二要素認証
            </div>
            <div
              style={{
                ...winStyle,
                textAlign: "left",
                fontSize: 13,
                lineHeight: 1.9,
                color: PALETTE.sub,
                marginBottom: 14,
              }}
            >
              ここから先(章構成・図鑑・セーブ・ラスボスの多層防御戦)は本実装(Vite
              + React + TS)で拡張予定。
            </div>
            <button
              style={{
                ...btn,
                border: "4px solid #fff",
                borderRadius: 3,
                padding: "10px 34px",
              }}
              onClick={startGame}
            >
              ▶ もういちど あそぶ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
