/**
 * Interactive Art Generator - メインアプリケーション
 * 革新的なUI/UXアイデアを統合したメインコントローラー
 */
class InteractiveArtGenerator {
    constructor() {
        this.canvas = document.getElementById('artCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 描画モードと描画エンジン
        this.currentMode = 'emotion';
        this.emotionMapper = new EmotionColorMapper(this.canvas, this.ctx);
        this.layerDrawer = new LayerTimeDrawer(this.canvas, this.ctx);
        this.musicDrawer = new MusicSyncDrawer(this.canvas, this.ctx);
        
        // 状態管理
        this.isDrawing = false;
        this.strokeCount = 0;
        this.lastInputTime = 0;
        this.inputHistory = [];
        
        // レスポンシブ対応
        this.setupCanvas();
        this.setupEventListeners();
        this.setupControls();
        
        // パフォーマンス最適化
        this.frameRate = 60;
        this.lastFrame = 0;
        this.performanceMode = false;
        
        console.log('Interactive Art Generator initialized');
    }

    /**
     * キャンバスのセットアップとレスポンシブ対応
     */
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 高DPI対応
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * キャンバスリサイズ
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // アスペクト比を維持しながらリサイズ
        const maxWidth = containerRect.width * 0.95;
        const maxHeight = containerRect.height * 0.85;
        const aspectRatio = 4 / 3;
        
        let canvasWidth = maxWidth;
        let canvasHeight = maxWidth / aspectRatio;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
        }
        
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
    }

    /**
     * イベントリスナーのセットアップ
     */
    setupEventListeners() {
        // マウスイベント
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('mouseout', (e) => this.handleEnd(e));
        
        // タッチイベント
        this.canvas.addEventListener('touchstart', (e) => this.handleStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleEnd(e));
        this.canvas.addEventListener('touchcancel', (e) => this.handleEnd(e));
        
        // コンテキストメニュー無効化
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * コントロールのセットアップ
     */
    setupControls() {
        // クリアボタン
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // 保存ボタン
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveArtwork();
        });
        
        // モード選択
        document.getElementById('modeSelect').addEventListener('change', (e) => {
            this.setMode(e.target.value);
        });
        
        // 強度スライダー
        document.getElementById('intensitySlider').addEventListener('input', (e) => {
            this.setIntensity(e.target.value / 10);
        });
    }

    /**
     * 描画開始処理
     */
    handleStart(event) {
        event.preventDefault();
        
        const pos = this.getInputPosition(event);
        if (!pos) return;
        
        this.isDrawing = true;
        this.lastInputTime = Date.now();
        
        // 指示テキストを非表示
        document.querySelector('.instructions').classList.add('hidden');
        
        // 各描画エンジンに開始を通知
        switch (this.currentMode) {
            case 'emotion':
                this.emotionMapper.startDrawing(pos.x, pos.y);
                break;
            case 'layer':
                this.layerDrawer.startDrawing(pos.x, y);
                break;
            case 'music':
                this.musicDrawer.startDrawing(pos.x, pos.y);
                break;
        }
        
        // タッチフィードバック
        if (event.type.startsWith('touch')) {
            this.showTouchFeedback(pos.x, pos.y);
        }
        
        // パフォーマンス監視開始
        this.startPerformanceMonitoring();
    }

    /**
     * 描画移動処理
     */
    handleMove(event) {
        event.preventDefault();
        
        if (!this.isDrawing) return;
        
        const pos = this.getInputPosition(event);
        if (!pos) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastInputTime;
        
        // フレームレート制御
        if (deltaTime < 1000 / this.frameRate) return;
        
        // 圧力感知（タッチデバイス）
        const pressure = this.getPressure(event);
        
        // 各描画エンジンで描画実行
        switch (this.currentMode) {
            case 'emotion':
                this.emotionMapper.draw(pos.x, pos.y, pressure);
                break;
            case 'layer':
                this.layerDrawer.draw(pos.x, pos.y);
                break;
            case 'music':
                this.musicDrawer.draw(pos.x, pos.y);
                break;
        }
        
        this.lastInputTime = currentTime;
        
        // 入力履歴を記録
        this.inputHistory.push({
            x: pos.x,
            y: pos.y,
            pressure: pressure,
            timestamp: currentTime
        });
        
        // 履歴サイズ制限
        if (this.inputHistory.length > 100) {
            this.inputHistory.shift();
        }
    }

    /**
     * 描画終了処理
     */
    handleEnd(event) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.strokeCount++;
        
        // 各描画エンジンに終了を通知
        switch (this.currentMode) {
            case 'emotion':
                this.emotionMapper.endDrawing();
                break;
            case 'layer':
                this.layerDrawer.endDrawing();
                break;
            case 'music':
                this.musicDrawer.endDrawing();
                break;
        }
        
        // UI更新
        this.updateStats();
        
        // パフォーマンス監視停止
        this.stopPerformanceMonitoring();
    }

    /**
     * 入力位置を取得（マウス・タッチ統一）
     */
    getInputPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (event.type.startsWith('touch')) {
            if (event.touches.length === 0) return null;
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    /**
     * 筆圧を取得
     */
    getPressure(event) {
        if (event.type.startsWith('touch') && event.touches.length > 0) {
            return event.touches[0].force || 1.0;
        }
        return 1.0;
    }

    /**
     * タッチフィードバック表示
     */
    showTouchFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }

    /**
     * キーボードショートカット
     */
    handleKeyboard(event) {
        switch (event.key) {
            case 'c':
            case 'C':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.clearCanvas();
                }
                break;
            case 's':
            case 'S':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.saveArtwork();
                }
                break;
            case '1':
                this.setMode('emotion');
                break;
            case '2':
                this.setMode('layer');
                break;
            case '3':
                this.setMode('music');
                break;
        }
    }

    /**
     * 描画モード設定
     */
    setMode(mode) {
        this.currentMode = mode;
        
        // 音楽モードの場合、音声入力を初期化
        if (mode === 'music') {
            this.musicDrawer.initializeAudio();
        }
        
        // UI更新
        document.getElementById('modeSelect').value = mode;
        this.updateModeDisplay();
    }

    /**
     * 強度設定
     */
    setIntensity(intensity) {
        // 各描画エンジンに強度を反映
        if (this.emotionMapper) {
            this.emotionMapper.intensity = intensity;
        }
        if (this.layerDrawer) {
            this.layerDrawer.setTimeSpeed(intensity);
        }
        if (this.musicDrawer) {
            this.musicDrawer.setSensitivity(intensity);
        }
    }

    /**
     * キャンバスクリア
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.strokeCount = 0;
        this.inputHistory = [];
        
        // 各描画エンジンをリセット
        if (this.layerDrawer) {
            this.layerDrawer.clearLayers();
        }
        
        this.updateStats();
        
        // 指示テキストを再表示
        document.querySelector('.instructions').classList.remove('hidden');
    }

    /**
     * アートワーク保存
     */
    saveArtwork() {
        try {
            const link = document.createElement('a');
            link.download = `interactive-art-${Date.now()}.png`;
            link.href = this.canvas.toDataURL();
            link.click();
            
            console.log('アートワークが保存されました');
        } catch (error) {
            console.error('保存に失敗しました:', error);
        }
    }

    /**
     * UI統計情報更新
     */
    updateStats() {
        document.getElementById('strokeCount').textContent = `軌跡数: ${this.strokeCount}`;
    }

    /**
     * モード表示更新
     */
    updateModeDisplay() {
        const modeNames = {
            emotion: '感情色彩',
            layer: 'レイヤー時空',
            music: '音楽シンクロ'
        };
        
        document.getElementById('currentMode').textContent = 
            `モード: ${modeNames[this.currentMode]}`;
    }

    /**
     * パフォーマンス監視開始
     */
    startPerformanceMonitoring() {
        this.lastFrame = performance.now();
        this.frameCount = 0;
    }

    /**
     * パフォーマンス監視停止
     */
    stopPerformanceMonitoring() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrame;
        const fps = this.frameCount / (elapsed / 1000);
        
        // FPSが低い場合、パフォーマンスモードを有効化
        if (fps < 30) {
            this.performanceMode = true;
            this.frameRate = 30;
            console.log('パフォーマンスモードが有効化されました');
        }
    }

    /**
     * アクセシビリティ対応
     */
    setupAccessibility() {
        // キーボードナビゲーション
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.setAttribute('role', 'application');
        this.canvas.setAttribute('aria-label', 'インタラクティブアート描画キャンバス');
        
        // スクリーンリーダー対応
        const description = document.createElement('div');
        description.className = 'sr-only';
        description.textContent = 'マウスまたはタッチで描画してください。1-3キーでモード切替、Ctrl+Cでクリア、Ctrl+Sで保存';
        document.body.appendChild(description);
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const app = new InteractiveArtGenerator();
    app.setupAccessibility();
    
    // グローバル参照（デバッグ用）
    window.interactiveArt = app;
});