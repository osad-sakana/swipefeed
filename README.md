# SwipeFeed - スワイプ操作RSSリーダーアプリ

SwipeFeedは、直感的なスワイプ操作でRSSフィードを読むことができるモバイルアプリです。

## 機能

### 🎯 メイン機能

- **スワイプ操作**: 右スワイプで既読、左スワイプでブックマーク
- **フルスクリーン表示**: 1記事ずつ集中して読める
- **スムーズアニメーション**: react-native-reanimatedによる滑らかな操作

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

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: Context API + useReducer
- **Database**: SQLite (expo-sqlite)
- **Storage**: AsyncStorage
- **Animations**: react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **RSS Parsing**: rss-parser

## プロジェクト構成

```text
src/
├── types/
│   └── index.ts              # TypeScript型定義
├── context/
│   └── AppContext.tsx        # Context API実装
├── services/
│   ├── DatabaseService.ts    # SQLite操作
│   ├── RSSService.ts         # RSS解析・取得
│   └── StorageService.ts     # AsyncStorage操作
├── screens/
│   ├── SwipeScreen.tsx       # メイン記事スワイプ画面
│   ├── FeedManagerScreen.tsx # フィード管理画面
│   ├── BookmarksScreen.tsx   # ブックマーク一覧画面
│   └── SettingsScreen.tsx    # 設定画面
├── components/
│   ├── ArticleCard.tsx       # スワイプ可能な記事カード
│   ├── SwipeGesture.tsx      # スワイプジェスチャーハンドラー
│   ├── FeedItem.tsx          # フィード管理用アイテム
│   └── EmptyState.tsx        # 空状態表示
└── utils/
    ├── dateUtils.ts          # 日付操作ユーティリティ
    └── swipeUtils.ts         # スワイプ動作ユーティリティ
```

## セットアップ

### 前提条件

- Node.js (v16以上)
- Expo CLI
- iOS Simulator / Android Emulator または実機

### インストール

1. 依存関係のインストール

```bash
npm install
```

1. アプリの起動

```bash
npm start
```

1. iOS/Androidでの実行

```bash
npm run ios
npm run android
```

## 使い方

### 初回セットアップ

1. アプリを起動
2. 「Feeds」タブでRSSフィードを追加
3. 「Swipe」タブで記事を読み始める

### スワイプ操作

- **右スワイプ (→)**: 記事を既読にして次へ
- **左スワイプ (←)**: 記事をブックマークして次へ

### フィード追加例

```text
https://feeds.feedburner.com/TechCrunch
https://www.wired.com/feed/rss
https://feeds.bbci.co.uk/news/rss.xml
```

## 主要コンポーネント

### SwipeGesture

PanGestureHandlerを使用したスワイプ検出とアニメーション制御

### ArticleCard

記事コンテンツの表示とスクロール機能

### DatabaseService

SQLiteでの記事とフィードのCRUD操作

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

### デバッグ

```bash
npm run lint        # ESLintチェック
npm run typecheck   # TypeScriptチェック
```

### ビルド

```bash
npm run build       # プロダクションビルド
eas build --platform ios     # iOS用ビルド
eas build --platform android # Android用ビルド
```

## 今後の拡張予定

- [ ] プッシュ通知
- [ ] オフライン読書モード
- [ ] 記事の全文検索
- [ ] ソーシャル共有機能
- [ ] 読書統計の表示
- [ ] カテゴリー別フィード整理
