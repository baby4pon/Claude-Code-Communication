# 🔧 セットアップ & トラブルシューティング完全ガイド

## 📋 環境セットアップ詳細

### 1. システム要件チェック

#### 最小要件
```bash
# OS確認
uname -a  # Linux/macOS
systeminfo | findstr "OS"  # Windows

# Pythonバージョン確認
python --version
# または
python3 --version

# ブラウザバージョン確認（ブラウザで以下を実行）
navigator.userAgent
```

#### 推奨スペック
- **CPU**: Intel i5-8400 / AMD Ryzen 5 2600 以上
- **RAM**: 8GB以上
- **GPU**: DirectX 11対応 / OpenGL 3.3対応
- **ストレージ**: 100MB以上の空き容量

### 2. 開発環境別セットアップ

#### Python環境
```bash
# Python 3.6以上の確認
python --version

# HTTP Serverの起動確認
python -m http.server --help

# ポート指定での起動
python -m http.server 8080

# 特定IPでの起動（ネットワーク共有時）
python -m http.server 8000 --bind 192.168.1.100
```

#### Node.js環境
```bash
# Node.js/npmの確認
node --version
npm --version

# serve パッケージのインストール
npm install -g serve

# http-server の使用
npm install -g http-server
http-server . -p 8000

# ローカルトンネルでの共有
npx localtunnel --port 8000
```

#### PHP環境
```bash
# PHP内蔵サーバー使用
php -S localhost:8000

# ドキュメントルート指定
php -S localhost:8000 -t ./output
```

#### Ruby環境
```bash
# Ruby内蔵サーバー使用
ruby -run -e httpd . -p 8000
```

### 3. 高度なセットアップ

#### Docker使用
```dockerfile
# Dockerfile
FROM nginx:alpine
COPY ./output /usr/share/nginx/html
EXPOSE 80
```

```bash
# ビルドと実行
docker build -t mouse-animation .
docker run -p 8000:80 mouse-animation
```

#### HTTPS対応（開発用）
```bash
# OpenSSLで自己署名証明書作成
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Python HTTPS サーバー
python -m http.server 8443 --cgi --protocol=HTTP/1.1
```

## 🚨 トラブルシューティング

### よくある問題と詳細解決方法

#### 1. ネットワーク関連

##### 「アクセスできません / ERR_CONNECTION_REFUSED」
```bash
# 原因チェック
netstat -an | grep 8000  # ポート使用状況確認

# 解決方法1: ポート変更
python -m http.server 3000
python -m http.server 8080

# 解決方法2: プロセス終了
lsof -ti:8000 | xargs kill -9  # Linux/macOS
netstat -ano | findstr :8000   # Windows でPID確認後taskkill
```

##### 「This site can't be reached」
```bash
# ファイアウォール確認
sudo ufw status  # Ubuntu
firewall-cmd --list-all  # CentOS

# Windows Defender確認
Get-NetFirewallRule -DisplayName "*Python*"
```

#### 2. ブラウザ関連

##### 「Mixed Content Error」
```bash
# HTTPSサイトからHTTPコンテンツアクセス時
# 解決方法: HTTPSサーバーで起動
python -m ssl -c "import ssl; print(ssl.create_default_context())"
```

##### 「CORS Error / Cross-Origin Request Blocked」
```bash
# 必ずWebサーバー経由でアクセス
# ファイル直接開きは不可
file:///path/to/index.html  # ❌ NG
http://localhost:8000/index.html  # ✅ OK
```

##### 「Cannot read properties of undefined」
```bash
# JavaScript モジュール読み込みエラー
# 解決方法1: ブラウザキャッシュクリア
Ctrl + F5  # 強制リロード

# 解決方法2: 開発者ツールでJavaScript有効確認
chrome://settings/content/javascript
```

#### 3. パフォーマンス関連

##### 「アニメーションがカクつく / FPS低下」
```javascript
// ブラウザコンソールで診断
console.log(performance.now());
console.log(navigator.hardwareConcurrency);
console.log(navigator.deviceMemory);

// パフォーマンス強制調整
demo.performanceSystem.setQualityLevel('Low');
demo.particleSwarm.setParticleCount(50);
```

##### 「メモリ不足エラー」
```bash
# システムリソース確認
free -h  # Linux
vm_stat  # macOS
taskmgr  # Windows

# ブラウザメモリ使用量確認
chrome://memory-internals/
about:memory  # Firefox
```

#### 4. WebGL関連

##### 「WebGL not supported」
```javascript
// WebGL対応確認
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
console.log('WebGL支援:', !!gl);
console.log('WebGL情報:', gl ? gl.getParameter(gl.VERSION) : 'なし');
```

```bash
# Chrome WebGL設定
chrome://flags/#enable-webgl2-compute-context
chrome://flags/#enable-unsafe-webgl

# 強制WebGL有効化
google-chrome --enable-webgl --ignore-gpu-blacklist
```

##### 「WebGL context lost」
```javascript
// WebGLコンテキスト復旧
canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.log('WebGL context lost, attempting recovery...');
});

canvas.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored');
    // アプリケーション再初期化
    window.location.reload();
});
```

### 5. OS別特殊問題

#### Windows
```cmd
# PowerShell実行ポリシー問題
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Windows Defender Smart Screen
# 「詳細情報」→「実行」をクリック

# ポート占有確認
netstat -ano | findstr :8000
taskkill /PID [PID番号] /F
```

#### macOS
```bash
# Gatekeeperによるブロック
sudo spctl --master-disable

# Pythonパス問題
which python3
alias python=python3

# macOS Monterey以降のAirPlay干渉
sudo lsof -i :5000  # AirPlayがポート5000使用
```

#### Linux
```bash
# ポート権限問題
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/python3

# SELinux問題
setsebool -P httpd_can_network_connect 1
setenforce 0  # 一時的無効化

# Ubuntu Snap Firefox問題
sudo snap remove firefox
sudo apt install firefox
```

## 🔍 診断ツール

### 自動診断スクリプト
```bash
#!/bin/bash
# diagnosis.sh

echo "=== システム診断開始 ==="

# Python確認
echo "Python: $(python --version 2>/dev/null || echo '未インストール')"

# ポート確認
echo "ポート8000: $(netstat -an 2>/dev/null | grep :8000 || echo '利用可能')"

# メモリ確認
echo "メモリ: $(free -h 2>/dev/null | grep Mem || echo '確認不可')"

# GPU確認
echo "GPU: $(lspci | grep VGA 2>/dev/null || echo '確認不可')"

echo "=== 診断完了 ==="
```

### ブラウザ診断
```javascript
// ブラウザコンソールで実行
function systemDiagnosis() {
    console.group('System Diagnosis');
    console.log('Browser:', navigator.userAgent);
    console.log('Hardware Concurrency:', navigator.hardwareConcurrency);
    console.log('Device Memory:', navigator.deviceMemory + 'GB');
    console.log('Connection:', navigator.connection?.effectiveType);
    
    // WebGL確認
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    console.log('WebGL Support:', !!gl);
    if (gl) {
        console.log('WebGL Vendor:', gl.getParameter(gl.VENDOR));
        console.log('WebGL Renderer:', gl.getParameter(gl.RENDERER));
    }
    
    // Performance API確認
    console.log('Performance Observer:', 'PerformanceObserver' in window);
    console.log('Web Workers:', 'Worker' in window);
    
    console.groupEnd();
}
systemDiagnosis();
```

## 📧 サポート情報収集

問題報告時に以下の情報を含めてください：

### 必須情報
```bash
# システム情報
echo "OS: $(uname -a)"
echo "Python: $(python --version)"
echo "Browser: [ブラウザ名とバージョン]"
echo "Error: [エラーメッセージ]"
```

### 詳細ログ
```javascript
// ブラウザコンソールログをコピー
console.log('=== Debug Info ===');
console.log('Timestamp:', new Date().toISOString());
console.log('URL:', window.location.href);
console.log('Errors:', window.errorLog || 'None');
```

### 再現手順
1. 実行したコマンド
2. 発生したエラー
3. 期待した動作
4. 実際の動作
5. 試した解決方法

## 🛡️ セキュリティ考慮事項

### ローカル開発環境
```bash
# 外部アクセス制限
python -m http.server 8000 --bind 127.0.0.1

# 一時的なファイアウォール設定
sudo ufw deny from any to any port 8000
```

### プロダクション環境注意
```bash
# 本システムは開発・デモ用途のみ
# 本番環境では追加のセキュリティ対策が必要
# - HTTPS対応
# - CSP設定
# - セキュリティヘッダー追加
```

---

これで完璧な環境構築と問題解決ができます！何か問題があれば、診断ツールを実行して詳細情報を収集してください。