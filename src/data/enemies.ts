import type { Enemy, EnemyId } from '../types'

// 敵キャラクター(= 実在のサイバー攻撃)。weak が正しい対策スキル。
// テキスト中の {n} はプレイヤー名に差し込まれる
export const ENEMIES: Record<EnemyId, Enemy> = {
  slime: {
    id: 'slime',
    name: 'ワームスライム',
    lv: 2,
    hp: 55,
    weak: 'vaccine',
    boss: false,
    intro: [
      'ワームスライムが あらわれた!',
      'クローンコード「放っておくと分裂して増えるタイプです! 早めに倒しましょう!」',
    ],
    hint: 'クローンコード「マルウェアには、まずスキャン…じゃないでしょうか?」',
    zukan: {
      no: 'No.001 ワーム',
      real: 'ネットワークを通じて自分で自分をコピーして広がるマルウェア。',
      taisaku:
        'ウイルス対策ソフトの導入と定義ファイルの更新。怪しいファイルは開く前にスキャン。',
      genjitsu:
        '自己増殖するワームが世界中のコンピュータに感染を広げた事例が、過去に何度も報告されている。',
      source: '出典:IPA「情報セキュリティ10大脅威」',
      link: 'https://www.ipa.go.jp/security/10threats/index.html',
    },
  },
  angler: {
    id: 'angler',
    name: 'フィッシング・アングラー',
    lv: 6,
    hp: 95,
    weak: 'url',
    boss: true,
    intro: [
      'フィッシング・アングラーが たちふさがった!',
      'クローンコード「第1章のボスです! 手紙の見た目にだまされないでくださいね!」',
    ],
    hint: 'クローンコード「偽物かどうか…どこを確かめるんでしたっけ?」',
    zukan: {
      no: 'No.002 フィッシング詐欺',
      real: '実在の企業や組織をかたる偽メール・偽サイトで、パスワードやカード情報を盗む攻撃。',
      taisaku:
        'リンクを開く前に送り主とURLを確認。公式アプリやブックマークからアクセスする。',
      genjitsu:
        '実在の組織をかたる偽メールで感染を広げるマルウェア「Emotet」が、国内でも大流行した事例が報告されている。',
      source: '出典:JPCERT/CC「マルウエアEmotetへの対応FAQ」',
      link: 'https://blogs.jpcert.or.jp/ja/2019/12/emotetfaq.html',
    },
  },
  maou: {
    id: 'maou',
    name: 'ゼロデイの魔王',
    lv: '??',
    hp: 999,
    weak: null,
    boss: true,
    intro: [
      'ゼロデイの魔王が しずかに こちらを見ている…',
      'クローンコード「気をつけて!『まだ誰も知らない弱点』から生まれた存在——どんな対策が通じるか、わたしにも分かりません!」',
    ],
    hint: '',
    zukan: null,
  },
}
