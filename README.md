# SwipeFeed - スワイプ操作RSSリーダーWebアプリ

SwipeFeedは、直感的なスワイプ操作でRSSフィードを読むことができるWebアプリケーションです。

## 機能

### 🎯 メイン機能

- **スワイプ操作**: 右スワイプで既読、左スワイプでブックマーク
- **フルスクリーン表示**: 1記事ずつ集中して読める
- **スムーズアニメーション**: framer-motionによる滑らかな操作

### 📡 フィード管理

- RSS/Atomフィードの追加・削除
- 複数フィードの統合表示
- 自動更新機能

### 🔖 ブックマーク

- スワイプでブックマーク
- ブックマーク一覧表示
- ワンタップでブックマーク解除

### ⚙️ 設定

- ダーク/ライトテーマ
- フォントサイズ調整
- スワイプ感度調整
- 自動更新間隔設定

## 技術スタック

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Navigation**: React Router DOM
- **State Management**: Context API + useReducer
- **Database**: IndexedDB (Dexie)
- **Storage**: localStorage
- **Styling**: styled-components
- **Animations**: framer-motion
- **RSS Parsing**: rss-parser

## プロジェクト構成

```text
src/
├── types/
│   └── index.ts              # TypeScript型定義
├── context/
│   └── AppContext.tsx        # Context API実装
├── services/
│   ├── DatabaseService.ts    # IndexedDB操作 (Dexie)
│   ├── RSSService.ts         # RSS解析・取得
│   └── StorageService.ts     # localStorage操作
├── screens/
│   ├── SwipeScreen.tsx       # メイン記事スワイプ画面
│   ├── FeedManagerScreen.tsx # フィード管理画面
│   ├── BookmarksScreen.tsx   # ブックマーク一覧画面
│   └── SettingsScreen.tsx    # 設定画面
├── components/
│   ├── ArticleCard.tsx       # スワイプ可能な記事カード
│   ├── SwipeGesture.tsx      # ドラッグジェスチャーハンドラー
│   ├── Layout.tsx            # ナビゲーションレイアウト
│   └── EmptyState.tsx        # 空状態表示
└── utils/
    ├── dateUtils.ts          # 日付操作ユーティリティ
    └── swipeUtils.ts         # スワイプ動作ユーティリティ
```

## セットアップ

### 前提条件

- Node.js (v18以上)
- モダンなWebブラウザ (Chrome, Firefox, Safari, Edge)

### インストール

1. 依存関係のインストール

```bash
npm install
```

2. 開発サーバーの起動

```bash
npm run dev
```

3. ブラウザで開く

```
http://localhost:3000
```

## 使い方

### 初回セットアップ

1. Webアプリを開く
2. 「フィード」タブでRSSフィードを追加
3. 「スワイプ」タブで記事を読み始める

### スワイプ操作

- **右ドラッグ (→)**: 記事を既読にして次へ
- **左ドラッグ (←)**: 記事をブックマークして次へ
- **マウス・タッチ対応**: PCでもスマートフォンでも使用可能

### フィード追加例

```text
https://feeds.feedburner.com/TechCrunch
https://www.wired.com/feed/rss
https://feeds.bbci.co.uk/news/rss.xml
```

## 主要コンポーネント

### SwipeGesture

framer-motionを使用したドラッグ検出とアニメーション制御

### ArticleCard

記事コンテンツの表示とスクロール機能

### DatabaseService

IndexedDB (Dexie) での記事とフィードのCRUD操作

### RSSService

RSS/Atomフィードの取得と解析

## カスタマイズ

### スワイプ設定の調整

```typescript
// src/utils/swipeUtils.ts
export const SWIPE_CONFIG = {
  THRESHOLD: SCREEN_WIDTH * 0.3, // スワイプ閾値
  VELOCITY_THRESHOLD: 500,       // 速度閾値
  ANIMATION_DURATION: 250,       // アニメーション時間
};
```

### テーマのカスタマイズ

```typescript
// src/context/AppContext.tsx
const customTheme: Theme = {
  name: 'custom',
  colors: {
    primary: '#your-color',
    // ...
  },
};
```

## ライセンス

MIT License

## 開発者向け情報

### 開発コマンド

```bash
npm run dev         # 開発サーバー起動
npm run build       # プロダクションビルド
npm run preview     # ビルド結果のプレビュー
npm run lint        # ESLintチェック
npm run typecheck   # TypeScriptチェック
```

### デプロイ

```bash
npm run build       # プロダクションビルド
# distフォルダを任意のWebサーバーにデプロイ
```

### 対応プラットフォーム

- **デスクトップ**: Chrome, Firefox, Safari, Edge
- **モバイル**: iOS Safari, Android Chrome
- **PWA対応**: オフライン機能とアプリライクな体験

## 今後の拡張予定

- [ ] PWA対応 (Service Worker)
- [ ] オフライン読書モード
- [ ] 記事の全文検索
- [ ] ソーシャル共有機能
- [ ] 読書統計の表示
- [ ] カテゴリー別フィード整理
- [ ] ダークモード切り替え
- [ ] レスポンシブデザインの最適化
