# 🚀 マウス追従インタラクティブアニメーション - ユーザーガイド

## 🎯 概要

Synaptic Flow（シナプティック・フロー）は、あなたのマウス操作に対してリアルタイムで美しく反応する革新的なインタラクティブアニメーションシステムです。4つの最先端技術が織りなす没入感のある体験をお楽しみください。

## ⚡ クイックスタート（最も簡単な方法）

### 1. ブラウザで即座に体験
```bash
# プロジェクトフォルダに移動
cd projects/mouse-interactive-animation/output

# お好みのWebサーバーで起動（以下のいずれかを選択）
```

**方法A: Python使用（推奨）**
```bash
# Python 3がインストールされている場合
python -m http.server 8000

# ブラウザで開く
# http://localhost:8000/index.html
```

**方法B: Node.js使用**
```bash
# npxが使用可能な場合
npx serve .

# または
npx http-server .
```

**方法C: Live Server（VS Code Extension）**
- VS Codeで `index.html` を右クリック
- "Open with Live Server" を選択

### 2. ブラウザで体験開始
1. **対応ブラウザで開く**（Chrome 90+、Firefox 88+、Safari 14+推奨）
2. **全画面表示推奨**（F11キーで切り替え可能）
3. **マウスを動かして体験開始！**

## 🎮 操作方法

### 基本操作
- **マウス移動**: パーティクルがリアルタイムで追従
- **マウス停止**: 予測エフェクトが自動的に表示
- **F11キー**: フルスクリーン切り替え
- **マウス速度**: 速度に応じてエフェクトが変化

### 体験できる4つの革新技術
1. **Neural Motion Prediction** - あなたのマウス軌道を先読み予測
2. **Quantum Particle Swarm** - 量子効果による有機的な群衆動作
3. **Adaptive Performance** - デバイス性能に応じた自動最適化
4. **Magnetism UI Transform** - 磁力による物理的なUI変形

## 📋 動作環境要件

### 必須環境
- **OS**: Windows 10+、macOS 10.15+、Linux（現代的ディストリビューション）
- **ブラウザ**: Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **RAM**: 最低 4GB（8GB以上推奨）
- **GPU**: DirectX 11対応またはOpenGL 3.3対応

### 推奨環境
- **CPU**: Intel i5相当以上
- **GPU**: 専用グラフィックカード
- **解像度**: 1920x1080以上
- **インターネット**: 不要（完全ローカル動作）

### 対応技術
- **WebGL**: 高品質エフェクト用
- **Web Workers**: パフォーマンス最適化用
- **Performance Observer API**: 動的品質調整用

## 🛠️ セットアップ手順

### ステップ1: プロジェクトの確認
```bash
# プロジェクト構造を確認
ls -la projects/mouse-interactive-animation/

# 必要なファイルがあることを確認
# ✅ output/index.html
# ✅ src/*.js（各種システムファイル）
# ✅ docs/（ドキュメント）
```

### ステップ2: Webサーバーの起動
プロジェクトはCORS制限により、ローカルファイルとして直接開くことができません。必ずWebサーバー経由でアクセスしてください。

**Python使用（最も確実）**
```bash
cd projects/mouse-interactive-animation/output
python -m http.server 8000
```

**Node.js環境の場合**
```bash
# serve パッケージをグローバルインストール（初回のみ）
npm install -g serve

# サーバー起動
cd projects/mouse-interactive-animation/output
serve .
```

### ステップ3: ブラウザアクセス
1. ブラウザで `http://localhost:8000/index.html` にアクセス
2. ローディング画面が表示されます
3. 「Synaptic Flow」タイトルが表示されたら準備完了
4. マウスを動かして体験開始！

## 🎨 カスタマイズオプション

### パフォーマンス調整
システムが自動的に最適化しますが、手動調整も可能：

```javascript
// ブラウザのコンソールで実行可能
// パーティクル数の調整
demo.particleSwarm.setParticleCount(200);

// エフェクト強度の調整
demo.magnetismTransformer.setGlobalStrength(1.5);

// 品質レベルの固定
demo.performanceSystem.setQualityLevel('High');
```

### 視覚効果のカスタマイズ
```javascript
// 色彩の変更
demo.visualEffects.setColorScheme('neon'); // 'classic', 'neon', 'galaxy'

// エフェクト速度の調整
demo.temporalEcho.setSpeed(0.8); // 0.1 - 2.0の範囲
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. 「ページが読み込まれない」
**症状**: ブラウザでファイルが開けない
**原因**: CORS制限
**解決方法**: 
```bash
# 必ずWebサーバー経由でアクセス
python -m http.server 8000
# その後 http://localhost:8000/index.html にアクセス
```

#### 2. 「エフェクトが重い・カクつく」
**症状**: アニメーションが滑らかでない
**原因**: デバイス性能不足
**解決方法**:
- 他のアプリケーションを閉じる
- ブラウザの他のタブを閉じる
- 品質が自動的に調整されるまで待つ

#### 3. 「一部エフェクトが表示されない」
**症状**: WebGLエフェクトが無効
**原因**: GPU未対応またはWebGL無効
**解決方法**:
```bash
# Chromeの場合
chrome://flags/#enable-webgl

# または
chrome://settings/content/all → JavaScript → 有効化
```

#### 4. 「モバイルで体験が制限される」
**症状**: スマートフォンで機能が限定的
**原因**: モバイル端末の性能制限
**解決方法**: デスクトップ環境での体験を推奨

### エラーメッセージ対応

| エラー | 原因 | 解決方法 |
|--------|------|----------|
| "モジュールの読み込みに失敗" | ファイルパス不正 | Webサーバー経由でのアクセス確認 |
| "WebGLに対応していない" | GPU未対応 | ブラウザのWebGL設定確認 |
| "ブラウザは一部機能に対応していない" | 古いブラウザ | ブラウザのアップデート |

### 開発者向けデバッグ

```javascript
// パフォーマンス情報の確認
console.log(demo.performanceSystem.getMetrics());

// システム情報の表示
console.log(demo.performanceSystem.getDeviceInfo());

// リアルタイムFPS監視
demo.performanceSystem.enableDebugMode();
```

## 📊 パフォーマンス指標

### 期待される性能
- **FPS**: 60fps（推奨環境）
- **初期化時間**: 2-3秒
- **メモリ使用量**: 30-50MB
- **CPU使用率**: 20-40%（アイドル時）

### 品質レベル自動調整
システムは以下の5段階で自動調整：
1. **Ultra**: 300粒子、全エフェクト有効
2. **High**: 200粒子、高品質エフェクト
3. **Medium**: 120粒子、標準エフェクト
4. **Low**: 60粒子、基本エフェクト  
5. **Potato**: 30粒子、最低限エフェクト

## 🔗 関連リソース

### ドキュメント
- [技術仕様書](technical-documentation.md) - 詳細な技術情報
- [革新的アイデア集](innovative-ideas.md) - 開発コンセプト
- [UI/UXデザイン](ui-ux-design-concept.md) - デザイン思想

### サポート
問題が解決しない場合は、以下の情報を含めてお問い合わせください：
- OS・ブラウザバージョン
- エラーメッセージ
- 再現手順
- ブラウザコンソールのログ

## 🎉 体験のコツ

### 最高の体験のために
1. **フルスクリーンモード**で体験（F11キー）
2. **マウス感度**を標準に設定
3. **照明を暗く**して画面に集中
4. **ゆっくりとした動き**から始めて徐々に高速化
5. **円を描く動き**で群衆効果を実感

### 隠れた機能
- マウスを画面端で停止すると特別なエフェクト
- 高速移動後の停止で予測軌道が可視化
- 特定のパターンで移動すると色彩が変化

## 🚀 次世代体験への準備

このシステムは将来の拡張に対応しています：
- **WebXR対応**: VR/AR環境での3D体験
- **音響連動**: Web Audio APIとの連携
- **AIエンハンス**: より高度な予測アルゴリズム

Synaptic Flowで、未来のインタラクティブ体験をお楽しみください！