/**
 * レイヤー時空間描画機能
 * 時間軸を活用した4次元描画体験を提供
 */
class LayerTimeDrawer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.layers = [];
        this.maxLayers = 10;
        this.currentLayer = 0;
        this.fadeSpeed = 0.005;
        this.animationId = null;
        this.isAnimating = false;
        this.timeOffset = 0;
    }

    /**
     * 新しいレイヤーを作成
     */
    createLayer() {
        const layer = {
            id: Date.now(),
            paths: [],
            alpha: 1.0,
            createdAt: Date.now(),
            depth: this.layers.length,
            color: this.generateLayerColor(this.layers.length)
        };
        
        this.layers.push(layer);
        
        // 最大レイヤー数を超えた場合、古いものを削除
        if (this.layers.length > this.maxLayers) {
            this.layers.shift();
        }
        
        this.currentLayer = this.layers.length - 1;
        return layer;
    }

    /**
     * レイヤーごとの色を生成
     */
    generateLayerColor(depth) {
        const hue = (depth * 45 + this.timeOffset) % 360;
        const saturation = 70 + Math.sin(depth * 0.5) * 20;
        const lightness = 50 + Math.cos(depth * 0.3) * 25;
        return { hue, saturation, lightness };
    }

    /**
     * 描画開始
     */
    startDrawing(x, y) {
        // 新しいパスを現在のレイヤーに追加
        if (this.layers.length === 0) {
            this.createLayer();
        }
        
        const currentLayerObj = this.layers[this.currentLayer];
        const newPath = {
            points: [{ x, y, timestamp: Date.now() }],
            startTime: Date.now(),
            color: currentLayerObj.color,
            width: 2 + Math.random() * 3
        };
        
        currentLayerObj.paths.push(newPath);
        
        // アニメーション開始
        if (!this.isAnimating) {
            this.startAnimation();
        }
    }

    /**
     * 描画実行
     */
    draw(x, y) {
        if (this.layers.length === 0) return;
        
        const currentLayerObj = this.layers[this.currentLayer];
        if (currentLayerObj.paths.length === 0) return;
        
        const currentPath = currentLayerObj.paths[currentLayerObj.paths.length - 1];
        currentPath.points.push({ x, y, timestamp: Date.now() });
    }

    /**
     * アニメーション開始
     */
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }

    /**
     * アニメーションループ
     */
    animate() {
        this.updateLayers();
        this.renderLayers();
        
        if (this.isAnimating) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    /**
     * レイヤーの状態を更新
     */
    updateLayers() {
        const currentTime = Date.now();
        this.timeOffset += 0.5;
        
        // 各レイヤーのアルファ値と色を更新
        this.layers.forEach((layer, index) => {
            const age = currentTime - layer.createdAt;
            const maxAge = 30000; // 30秒でフェードアウト完了
            
            // 時間経過によるフェードアウト
            layer.alpha = Math.max(0, 1 - (age / maxAge));
            
            // 深度による色の変化
            layer.color = this.generateLayerColor(index + this.timeOffset * 0.01);
            
            // パスの更新
            layer.paths.forEach(path => {
                const pathAge = currentTime - path.startTime;
                path.alpha = Math.max(0, 1 - (pathAge / maxAge));
            });
        });
        
        // アルファ値が0になったレイヤーを削除
        this.layers = this.layers.filter(layer => layer.alpha > 0);
        
        // アニメーション停止条件
        if (this.layers.length === 0) {
            this.stopAnimation();
        }
    }

    /**
     * 全レイヤーをレンダリング
     */
    renderLayers() {
        // 背景を少し暗くして軌跡を際立たせる
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 深度順にレイヤーを描画（奥から手前へ）
        this.layers.forEach((layer, layerIndex) => {
            this.renderLayer(layer, layerIndex);
        });
    }

    /**
     * 単一レイヤーをレンダリング
     */
    renderLayer(layer, layerIndex) {
        const { hue, saturation, lightness } = layer.color;
        const layerAlpha = layer.alpha;
        
        layer.paths.forEach(path => {
            if (path.points.length < 2) return;
            
            const pathAlpha = (path.alpha || 1) * layerAlpha;
            if (pathAlpha <= 0) return;
            
            // 深度による視覚効果
            const depthFactor = 1 - (layerIndex / this.maxLayers) * 0.5;
            const adjustedWidth = path.width * depthFactor;
            const adjustedAlpha = pathAlpha * depthFactor;
            
            // グラデーション効果
            const startPoint = path.points[0];
            const endPoint = path.points[path.points.length - 1];
            
            const gradient = this.ctx.createLinearGradient(
                startPoint.x, startPoint.y,
                endPoint.x, endPoint.y
            );
            
            gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${adjustedAlpha})`);
            gradient.addColorStop(0.5, `hsla(${(hue + 30) % 360}, ${saturation + 10}%, ${lightness + 10}%, ${adjustedAlpha * 0.8})`);
            gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, ${saturation}%, ${lightness}%, ${adjustedAlpha * 0.6})`);
            
            this.drawPath(path, gradient, adjustedWidth);
            
            // パーティクル効果（新しいパスのみ）
            if (pathAlpha > 0.8) {
                this.addTimeParticles(path, layerIndex);
            }
        });
    }

    /**
     * パスを描画
     */
    drawPath(path, strokeStyle, lineWidth) {
        if (path.points.length < 2) return;
        
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // スムーズな曲線で描画
        this.ctx.beginPath();
        this.ctx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let i = 1; i < path.points.length - 1; i++) {
            const currentPoint = path.points[i];
            const nextPoint = path.points[i + 1];
            const controlX = (currentPoint.x + nextPoint.x) / 2;
            const controlY = (currentPoint.y + nextPoint.y) / 2;
            
            this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
        }
        
        // 最後の点
        if (path.points.length > 1) {
            const lastPoint = path.points[path.points.length - 1];
            this.ctx.lineTo(lastPoint.x, lastPoint.y);
        }
        
        this.ctx.stroke();
    }

    /**
     * 時空間パーティクル効果
     */
    addTimeParticles(path, layerIndex) {
        const currentTime = Date.now();
        const recentPoints = path.points.filter(point => 
            currentTime - point.timestamp < 1000
        );
        
        recentPoints.forEach((point, index) => {
            if (index % 3 !== 0) return; // 間引いて処理
            
            const age = currentTime - point.timestamp;
            const alpha = Math.max(0, 1 - age / 1000);
            
            // 時間の流れを表現するパーティクル
            const timePhase = (currentTime + layerIndex * 1000) * 0.01;
            const radius = 2 + Math.sin(timePhase) * 1;
            const offsetX = Math.cos(timePhase + index) * 3;
            const offsetY = Math.sin(timePhase + index) * 3;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(
                point.x + offsetX, 
                point.y + offsetY, 
                radius, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    /**
     * 描画終了
     */
    endDrawing() {
        // 新しいレイヤーを作成（次の描画用）
        this.createLayer();
    }

    /**
     * アニメーション停止
     */
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * 全てのレイヤーをクリア
     */
    clearLayers() {
        this.layers = [];
        this.currentLayer = 0;
        this.stopAnimation();
    }

    /**
     * 時間倍速設定
     */
    setTimeSpeed(speed) {
        this.fadeSpeed = 0.005 * speed;
    }

    /**
     * レイヤー情報を取得
     */
    getLayerInfo() {
        return {
            layerCount: this.layers.length,
            currentLayer: this.currentLayer,
            isAnimating: this.isAnimating,
            totalPaths: this.layers.reduce((sum, layer) => sum + layer.paths.length, 0)
        };
    }
}