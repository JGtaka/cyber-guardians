# ASSETS.md — 素材管理台帳

第三者素材の使用点数と出所の記録(規約変更時の証跡)。詳細方針は docs/sound.md 参照。

出所は各ファイルの Zone.Identifier(ブラウザがダウンロード時に記録する元URL)から復元。
魔王魂は楽曲を「8bit27」のような素材IDで識別しており、下表の「素材ID」がそれにあたる。

## クレジット表記(README とゲーム内に記載)

`音楽・効果音:魔王魂(https://maou.audio/)`

> [!注意] BGM・SEとも**全17点が魔王魂**(効果音ラボは未使用)。
> 魔王魂は**クレジット表記が必須**(商用可・報告不要)。表記場所は自由。
> フレーズの盗用、楽曲そのものの再配布・音楽配信サービスへの登録は禁止。

## BGM(public/bgm/ 8曲)すべて魔王魂

| ファイル | 用途 | 素材ID | ダウンロード元URL | DL日 |
|---|---|---|---|---|
| title.mp3 | タイトル画面 | maou_bgm_8bit27 | https://maou.audio/sound/bgm/maou_bgm_8bit27.mp3 | 2026-07-13 |
| daily.mp3 | 会話シーン(プロローグ・章の会話) | maou_bgm_8bit29 | https://maou.audio/sound/bgm/maou_bgm_8bit29.mp3 | 2026-07-13 |
| btl_normal.mp3 | 雑魚戦 | maou_bgm_8bit28 | https://maou.audio/sound/bgm/maou_bgm_8bit28.mp3 | 2026-07-13 |
| btl_boss.mp3 | 章ボス戦(当面は魔王戦も兼用) | maou_bgm_8bit07 | https://maou.audio/sound/bgm/maou_bgm_8bit07.mp3 | 2026-07-13 |
| btl_final.mp3 | 最終決戦(v5まで未使用) | maou_game_battle10 | https://maou.audio/sound/game/maou_game_battle10.mp3 | 2026-07-13 |
| jgl_win.mp3 | 勝利ジングル(ループなし) | maou_game_jingle02 | https://maou.audio/sound/game/maou_game_jingle02.mp3 | 2026-07-13 |
| jgl_clear.mp3 | 章クリアジングル(ループなし) | maou_se_onepoint01 | https://maou.audio/sound/se/maou_se_onepoint01.mp3 | 2026-07-13 |
| jgl_gameover.mp3 | ゲームオーバー(ループなし) | maou_bgm_8bit20 | https://maou.audio/sound/bgm/maou_bgm_8bit20.mp3 | 2026-07-13 |

一覧ページ(素材の再確認用):
- 8bit BGM https://maou.audio/category/bgm/bgm-8bit/
- ゲーム・バトル https://maou.audio/category/game/game-battle/
- ゲーム・ジングル https://maou.audio/category/game/game-jingle/

## SE(public/se/ 9種)すべて魔王魂

| ファイル | トリガー | 素材ID | ダウンロード元URL | DL日 |
|---|---|---|---|---|
| se_decide.mp3 | 決定(コマンド選択・ボタン押下) | maou_se_system49 | https://maou.audio/sound/se/maou_se_system49.mp3 | 2026-07-13 |
| se_message.mp3 | メッセージ送り(▼クリック) | maou_se_system40 | https://maou.audio/sound/se/maou_se_system40.mp3 | 2026-07-13 |
| se_cursor.mp3 | メニュー切替(スキル一覧の開閉) | maou_se_system13 | https://maou.audio/sound/se/maou_se_system13.mp3 | 2026-07-13 |
| se_attack.mp3 | 通常攻撃ヒット | maou_se_battle18 | https://maou.audio/sound/se/maou_se_battle18.mp3 | 2026-07-13 |
| se_skill.mp3 | スキル命中(弱点以外)・ファイアウォール展開 | maou_se_battle10 | https://maou.audio/sound/se/maou_se_battle10.mp3 | 2026-07-13 |
| se_weak.mp3 | WEAK POINT=弱点ヒット(画面フラッシュと同時。se_skillとは鳴らし分け) | maou_se_battle17 | https://maou.audio/sound/se/maou_se_battle17.mp3 | 2026-07-13 |
| se_damage.mp3 | 被弾(画面シェイクと同時) | maou_se_battle12 | https://maou.audio/sound/se/maou_se_battle12.mp3 | 2026-07-13 |
| se_continue.mp3 | ゲームオーバーからのリトライ | maou_se_onepoint16 | https://maou.audio/sound/se/maou_se_onepoint16.mp3 | 2026-07-13 |
| se_powerup.mp3 | 奥義ミュートスの詠唱(パワーアップ系の溜め音) | maou_se_battle02 | https://maou.audio/sound/se/maou_se_battle02.mp3 | 2026-07-13 |

一覧ページ(素材の再確認用):
- 戦闘SE https://maou.audio/category/se/se-battle/
- システムSE https://maou.audio/category/se/se-system/
- ワンポイントSE https://maou.audio/category/se/se-onepoint/

## いらすとや

使用点数:0 / 20(商用21点以上有償のため要管理)

## 提出前チェック

- [ ] クレジット表記が README とゲーム内(タイトル画面フッター)にあるか
- [ ] 魔王魂の規約を再確認(最終確認:2026-07-13)
- [ ] 大会規約の第三者素材条項を確認
