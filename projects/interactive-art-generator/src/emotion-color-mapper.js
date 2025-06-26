/**
 * 感情色彩マッピング機能
 * マウスの動きの速度や方向に基づいて色彩と軌跡を変化させる
 */
class EmotionColorMapper {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lastPos = { x: 0, y: 0 };
        this.lastTime = 0;
        this.velocityHistory = [];
        this.maxHistoryLength = 10;
        this.isDrawing = false;
    }

    /**
     * 速度と方向から感情を分析
     */
    analyzeEmotion(velocity, direction, pressure = 1) {
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const angle = Math.atan2(velocity.y, velocity.x);
        
        // 速度による感情分類
        let emotionType;
        if (speed > 15) {
            emotionType = 'excitement'; // 興奮・エネルギッシュ
        } else if (speed > 8) {
            emotionType = 'joy'; // 喜び・活動的
        } else if (speed > 3) {
            emotionType = 'calm'; // 穏やか・リラックス
        } else {
            emotionType = 'contemplation'; // 瞑想・静寂
        }

        return {
            type: emotionType,
            intensity: Math.min(speed / 20, 1),
            direction: angle,
            pressure: pressure
        };
    }

    /**
     * 感情に基づいて色を生成
     */
    generateEmotionColor(emotion) {
        const { type, intensity, direction } = emotion;
        
        let hue, saturation, lightness, alpha;
        
        switch (type) {
            case 'excitement':
                hue = (Math.sin(direction) + 1) * 30 + 340; // 赤〜オレンジ
                saturation = 80 + intensity * 20;
                lightness = 50 + intensity * 30;
                alpha = 0.7 + intensity * 0.3;
                break;
            case 'joy':
                hue = (Math.cos(direction) + 1) * 30 + 40; // 黄〜オレンジ
                saturation = 70 + intensity * 25;
                lightness = 60 + intensity * 20;
                alpha = 0.6 + intensity * 0.3;
                break;
            case 'calm':
                hue = (Math.sin(direction * 2) + 1) * 40 + 180; // 青〜緑
                saturation = 50 + intensity * 30;
                lightness = 50 + intensity * 25;
                alpha = 0.5 + intensity * 0.4;
                break;
            case 'contemplation':
                hue = (Math.cos(direction * 3) + 1) * 60 + 240; // 青〜紫
                saturation = 40 + intensity * 20;
                lightness = 40 + intensity * 30;
                alpha = 0.4 + intensity * 0.3;
                break;
        }

        return `hsla(${hue % 360}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    /**
     * 感情に基づいて線の太さを計算
     */
    calculateLineWidth(emotion, baseWidth = 2) {
        const { intensity, type } = emotion;
        
        let multiplier;
        switch (type) {
            case 'excitement':
                multiplier = 3 + intensity * 4;
                break;
            case 'joy':
                multiplier = 2 + intensity * 3;
                break;
            case 'calm':
                multiplier = 1.5 + intensity * 2;
                break;
            case 'contemplation':
                multiplier = 1 + intensity * 1.5;
                break;
        }

        return baseWidth * multiplier;
    }

    /**
     * 描画開始
     */
    startDrawing(x, y) {
        this.isDrawing = true;
        this.lastPos = { x, y };
        this.lastTime = Date.now();
        this.velocityHistory = [];
    }

    /**
     * 描画実行
     */
    draw(x, y, pressure = 1) {
        if (!this.isDrawing) return;

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > 0) {
            const velocity = {
                x: (x - this.lastPos.x) / deltaTime * 16, // 60fps基準で正規化
                y: (y - this.lastPos.y) / deltaTime * 16
            };

            // 速度履歴を更新
            this.velocityHistory.push(velocity);
            if (this.velocityHistory.length > this.maxHistoryLength) {
                this.velocityHistory.shift();
            }

            // 平滑化された速度を計算
            const smoothedVelocity = this.calculateSmoothedVelocity();
            
            // 感情分析
            const emotion = this.analyzeEmotion(smoothedVelocity, 0, pressure);
            
            // 描画スタイル設定
            const color = this.generateEmotionColor(emotion);
            const lineWidth = this.calculateLineWidth(emotion);
            
            // 軌跡描画
            this.drawTrail(this.lastPos.x, this.lastPos.y, x, y, color, lineWidth, emotion);
            
            this.lastPos = { x, y };
            this.lastTime = currentTime;
        }
    }

    /**
     * 平滑化された速度を計算
     */
    calculateSmoothedVelocity() {
        if (this.velocityHistory.length === 0) {
            return { x: 0, y: 0 };
        }

        const sum = this.velocityHistory.reduce((acc, vel) => ({
            x: acc.x + vel.x,
            y: acc.y + vel.y
        }), { x: 0, y: 0 });

        return {
            x: sum.x / this.velocityHistory.length,
            y: sum.y / this.velocityHistory.length
        };
    }

    /**
     * 美しい軌跡を描画
     */
    drawTrail(x1, y1, x2, y2, color, lineWidth, emotion) {
        const { intensity, type } = emotion;
        
        // グラデーション効果
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.adjustColorAlpha(color, 0.3));
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // 感情に応じた描画効果
        if (type === 'excitement') {
            // 興奮状態：軌跡に振動効果
            this.drawVibrantLine(x1, y1, x2, y2, intensity);
        } else if (type === 'contemplation') {
            // 瞑想状態：点線効果
            this.drawDottedLine(x1, y1, x2, y2, intensity);
        } else {
            // 通常の滑らかな線
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        // パーティクル効果（高強度の場合）
        if (intensity > 0.7) {
            this.addParticleEffect(x2, y2, color, intensity);
        }
    }

    /**
     * 振動効果のある線を描画
     */
    drawVibrantLine(x1, y1, x2, y2, intensity) {
        const segments = Math.floor(Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)) / 5);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            const vibration = Math.sin(t * Math.PI * 4) * intensity * 3;
            const perpX = -(y2 - y1) / Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)) * vibration;
            const perpY = (x2 - x1) / Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)) * vibration;
            
            this.ctx.lineTo(x + perpX, y + perpY);
        }
        
        this.ctx.stroke();
    }

    /**
     * 点線効果
     */
    drawDottedLine(x1, y1, x2, y2, intensity) {
        const distance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        const dashLength = 5 + intensity * 10;
        const gapLength = 3 + intensity * 5;
        
        this.ctx.setLineDash([dashLength, gapLength]);
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    /**
     * パーティクル効果
     */
    addParticleEffect(x, y, color, intensity) {
        const particleCount = Math.floor(intensity * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = intensity * 15;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            this.ctx.fillStyle = this.adjustColorAlpha(color, 0.6);
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, intensity * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * 色のアルファ値を調整
     */
    adjustColorAlpha(color, newAlpha) {
        return color.replace(/[\d.]+\)$/g, `${newAlpha})`);
    }

    /**
     * 描画終了
     */
    endDrawing() {
        this.isDrawing = false;
        this.velocityHistory = [];
    }
}