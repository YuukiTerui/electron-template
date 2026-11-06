# Electron Native Tool Template

[electron-vite](https://electron-vite.org/) をベースにした、モダンなネイティブデスクトップアプリ用テンプレートです。
React 19 + TypeScript + Tailwind CSS v4 を標準採用し、ファイル選択・OS通知・システム情報取得などの実用的な IPC 設計があらかじめ組み込まれています。

## 🚀 主な構成・機能

- **Core**: [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- **UI Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + `prettier-plugin-tailwindcss`（クラス自動ソート）
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + JSDOM
- **Native Window / UX (クロスプラットフォーム対応)**:
  - **macOS**: `trafficLightPosition` で調整したトラフィックライト（赤黄緑ボタン）対応の `hidden` タイトルバー
  - **Windows**: `titleBarOverlay`（Window Controls Overlay）による VS Code / Discord 風のモダンフレームレス一体型ウィンドウ
  - ドラッグ領域（`-webkit-app-region: drag` / `app-drag` クラス）ユーティリティ定義済み
- **実用的なネイティブ IPC**:
  - `getSystemInfo`: OS・CPU・メモリ・ランタイム情報のリアルタイム取得
  - `selectFile`: ネイティブファイル選択ダイアログ (`dialog.showOpenDialog`)
  - `showNotification`: OSデスクトッププッシュ通知 (`Notification`)
  - `ping`: IPC往復レイテンシ計測
  - `contextBridge` + `src/preload/index.d.ts` による厳格な型推論
- **セキュリティ対策**:
  - `will-navigate` による外部ドメイン遷移遮断
  - `setWindowOpenHandler` による外部リンクの標準ブラウザ転送
- **CI / CD (GitHub Actions)**:
  - `.github/workflows/ci.yml`: macOS / Windows / Ubuntu でのマトリクス自動検証（Format / Lint / Typecheck / Vitest / Build）
  - `.github/workflows/release.yml`: バージョンタグプッシュ（`v*`）時の自動インストーラビルド

---

## 📁 ディレクトリ構成

```text
├── .github/
│   └── workflows/
│       ├── ci.yml            # 品質チェック & マルチOSビルド
│       └── release.yml       # タグプッシュ時のインストーラ自動作成
├── build/                    # アイコンやプラットフォーム別ビルドリソース
├── resources/                # アプリ実行時に参照される静的リソース
├── src/
│   ├── main/                # メインプロセス (Node.js / ウィンドウ管理・ネイティブAPI)
│   │   └── index.ts
│   ├── preload/             # プリロードスクリプト (Main と Renderer の安全な橋渡し)
│   │   ├── index.ts         # contextBridge による API 公開
│   │   └── index.d.ts      # window.api の厳格な型定義
│   └── renderer/            # レンダラープロセス (React 19 / Webフロントエンド)
│       ├── index.html
│       └── src/
│           ├── assets/      # CSS (Tailwind CSS v4) やアセット
│           ├── test/        # テストセットアップ (setup.ts)
│           ├── App.tsx      # ミニマルツールUI
│           ├── App.test.tsx # React Testing Library による単体テスト
│           └── main.tsx
├── electron-builder.yml     # パッケージング・インストーラ設定
├── electron.vite.config.ts    # electron-vite / Vite のビルド設定
├── vitest.config.mts        # Vitest 単体テスト設定
├── mise.toml                # Node.js バージョン管理 (mise)
└── package.json
```

---

## 🛠️ 開発クイックスタート

### 動作要件

- Node.js >= 20 (推奨: 22 / 24, `mise` 対応)
- npm >= 9

### インストール

```bash
npm install
```

### 開発サーバー起動 (HMR)

```bash
npm run dev
```

### コード検証・テスト & フォーマット

```bash
# Vitest 単体テストの実行
npm test

# Vitest ウォッチモード
npm run test:watch

# TypeScript 型チェック
npm run typecheck

# ESLint 静的解析
npm run lint

# ESLint 自動修正
npm run lint:fix

# Prettier フォーマットチェック (CI用)
npm run format:check

# Prettier コード整形 (Tailwind クラス順序の自動ソート含む)
npm run format
```

### プロダクションビルド & パッケージング

```bash
# ビルド (型チェック + Vite バンドル)
npm run build

# 実行バイナリだけをフォルダ展開 (デバッグ用・インストーラ化しない)
npm run build:unpack

# プラットフォーム別インストーラ / バイナリ作成
npm run build:mac     # macOS (.dmg)
npm run build:win     # Windows (.exe / NSIS)
npm run build:linux   # Linux (AppImage, deb)
```

---

## 💡 IPC (プロセス間通信) の追加方法

Renderer と Main プロセス間で新しい API を追加する手順です。

1. **Main プロセスでハンドラを登録** (`src/main/index.ts`):

   ```ts
   ipcMain.handle('your-channel', async (_event, arg: string) => {
     return `Processed: ${arg}`
   })
   ```

2. **Preload スクリプトで関数を公開** (`src/preload/index.ts`):

   ```ts
   export const api = {
     yourFunction: (arg: string): Promise<string> => ipcRenderer.invoke('your-channel', arg)
   }
   ```

3. **型定義を追加** (`src/preload/index.d.ts`):

   ```ts
   export interface IElectronAPI {
     yourFunction: (arg: string) => Promise<string>
   }
   ```

4. **Renderer (React) から型推論付きで呼び出し** (`src/renderer/src/App.tsx`):
   ```tsx
   const result = await window.api.yourFunction('hello')
   ```

---

## 🎨 タイトルバーと Tailwind CSS v4

- `src/renderer/src/assets/main.css` で `@import "tailwindcss";` をインポートしています。
- タイトルバーをドラッグ可能にするには `app-drag` クラスを付与し、ボタンなどクリックしたい子要素には `app-no-drag` クラスを付与してください。
- **クロスプラットフォーム余白対応**:
  - macOS: 左上のトラフィックライトを避けるため `pl-20 pr-4`
  - Windows: 右上の Window Controls Overlay (最小化・最大化・閉じる) を避けるため `pl-4 pr-36`

---

## 📦 配布・リリースまでの完全チェックリスト (Release Checklist)

開発したアプリを一般公開・リリースするまでに確認・実行すべきステップの TODO リストです。

### 1. アプリのメタ情報・アイコン設定

- [ ] **アプリアイコンの差し替え** (`build/` ディレクトリ)
  - `build/icon.icns`: macOS 用アイコン（16x16 〜 512x512@2x を内包するマルチ解像度ファイル）
  - `build/icon.ico`: Windows 用アイコン（マルチサイズ ico ファイル）
  - `build/icon.png` および `resources/icon.png`: Linux・タスクバー用（512x512 または 1024x1024 PNG）
  - _(Tip: 1 枚の 1024x1024 PNG 画像から `electron-icon-builder` などのツールを使うと全形式を一発生成できます)_
- [ ] **アプリ識別子・名称の更新**
  - [`package.json`](./package.json): `"name"`, `"description"`, `"author"`
  - [`electron-builder.yml`](./electron-builder.yml):
    - `appId`: 一意の ID（例: `com.yourcompany.appname`）
    - `productName`: OS に表示されるアプリの表示名（例: `My Cool App`）
    - `win.executableName`: Windows の実行可能ファイル名（例: `My-Cool-App`）
- [ ] **ウィンドウタイトル・HTMLメタ情報**
  - [`src/renderer/index.html`](./src/renderer/index.html): `<title>` タグの変更

### 2. セキュリティとコード署名 (Code Signing)

> ⚠️ 署名がなくてもアプリの配布自体は可能ですが、ダウンロード時に OS から警告（macOS: Gatekeeper、Windows: SmartScreen）が表示されます。

- [ ] **macOS 署名 & 公証 (Notarization)**
  - Apple Developer Program（年間 $99）のアカウントが必要
  - 証明書（`Developer ID Application`）を取得
  - GitHub Actions の Secrets に以下を設定して自動署名・公証化：
    - `APPLE_ID`: Apple ID メールアドレス
    - `APPLE_APP_SPECIFIC_PASSWORD`: Apple ID 管理画面で生成した App 用パスワード
    - `APPLE_TEAM_ID`: Apple 開発者チーム ID
    - `CSC_LINK` / `CSC_KEY_PASSWORD`: 証明書（.p12）の Base64 文字列とパスワード
  - `electron-builder.yml` の `mac.notarize` を有効化
- [ ] **Windows 署名 (Code Signing)**
  - コードサイニング証明書（EV 証明書、または Azure Trusted Signing）を取得
  - `CSC_LINK` / `CSC_KEY_PASSWORD` を設定（未署名で配布する場合は、ユーザーに「詳細情報」→「実行」をクリックしてもらう運用となります）

### 3. 自動更新 (Auto Update) の準備（オプション）

- [ ] [`electron-builder.yml`](./electron-builder.yml) の `publish.provider`（デフォルト: `github`）を確認
- [ ] GitHub リポジトリの準備（パブリックリポジトリ、またはプライベートリポジトリ）
- [ ] Main プロセスで `electron-updater` を利用する場合、`autoUpdater.checkForUpdatesAndNotify()` を起動時に実行するコードを追加

### 4. ビルド検証と GitHub Releases 公開

- [ ] **ローカル動作確認**:
  ```bash
  # パッケージング直前のコード検証
  npm run format:check && npm run lint && npm run typecheck && npm test
  # ディレクトリ展開で実機動作テスト
  npm run build:unpack
  ```
- [ ] **バージョン番号の更新**:
  - `package.json` の `"version"` をインクリメント（例: `"1.0.0"` → `"1.0.1"`）
- [ ] **GitHub へリリースタグを Push**:
  ```bash
  git add .
  git commit -m "chore: release v1.0.0"
  git tag v1.0.0
  git push origin main --tags
  ```
- [ ] **GitHub Actions の確認**:
  - `.github/workflows/release.yml` が自動起動し、macOS (`.dmg`)、Windows (`.exe`)、Linux (`.AppImage`, `.deb`) の各インストーラが自動ビルドされ、GitHub Releases にアップロードされます。
