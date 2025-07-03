# ⚡ 超簡単スタートガイド - マウス追従インタラクティブアニメーション

## 🚀 30秒で起動！

### ステップ1: コマンド実行
```bash
cd projects/mouse-interactive-animation/output
python -m http.server 8000
```

### ステップ2: ブラウザで開く
```
http://localhost:8000/index.html
```

### ステップ3: 体験開始
マウスを動かすだけ！🎨

---

## 📋 必要な環境

✅ **Python 3** (どのバージョンでもOK)  
✅ **モダンブラウザ** (Chrome, Firefox, Safari, Edge)  
✅ **インターネット不要** (完全ローカル動作)

---

## 🛟 うまくいかない場合

### Pythonがない場合
```bash
# Node.js使用
npx serve .

# または VS Code + Live Server Extension
```

### ポート8000が使われている場合
```bash
python -m http.server 3000
# http://localhost:3000/index.html でアクセス
```

### ファイルが見つからない場合
```bash
# 現在地確認
pwd
# /path/to/projects/mouse-interactive-animation/output にいることを確認

# ファイル確認
ls -la
# index.html, visual-effects-system.js, temporal-echo-effect.js があることを確認
```

### ✅ 修正済み問題
- **404エラー**: visual-effects-system.js と temporal-echo-effect.js のパス問題を修正済み
- **ファイル配置**: 必要なファイルは全て output/ フォルダ内に配置済み

---

## 🎮 体験の仕方

1. **F11** でフルスクリーン（推奨）
2. **マウスをゆっくり動かす** → パーティクルが追従
3. **高速移動** → 予測エフェクト発動
4. **円を描く** → 群衆効果を体感
5. **画面端で停止** → 特別エフェクト

---

## 📱 モバイルでも動作

スマートフォンでも基本動作しますが、デスクトップでの体験を強く推奨します。

---

## 🔧 カスタマイズ

ブラウザコンソール（F12）で以下を実行：
```javascript
// パーティクル数変更
demo.particleSwarm.setParticleCount(300);

// エフェクト強度変更
demo.magnetismTransformer.setGlobalStrength(2.0);
```

---

**問題解決しない？** → [詳細ガイド](docs/USER_GUIDE.md) をご確認ください！