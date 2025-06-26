// Optimized Interactive Art Generator - パフォーマンス最適化版
class OptimizedInteractiveArtGenerator {
    constructor() {
        this.canvas = document.getElementById('artCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, velocity: 0 };
        this.isDrawing = false;
        this.animationFrame = null;
        
        // パフォーマンス管理
        this.performance = {
            fps: 60,
            targetFps: 60,
            lastFrameTime: 0,
            frameCount: 0,
            adaptiveQuality: true,
            qualityLevel: 1.0 // 0.5 - 1.0
        };
        
        // オブジェクトプール
        this.particlePool = [];
        this.trailPointPool = [];
        this.poolSize = 2000;
        
        this.initializeObjectPools();
        this.initCanvas();
        this.initSystems();
        this.initEventListeners();
        this.startOptimizedAnimation();
        
        console.log('Optimized Interactive Art Generator initialized');
    }
    
    initializeObjectPools() {
        // パーティクルプール初期化
        for (let i = 0; i < this.poolSize; i++) {
            this.particlePool.push({
                active: false,
                x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0,
                size: 0, life: 0, maxLife: 0,
                color: { h: 0, s: 0, l: 0 }, brightness: 0
            });
            
            this.trailPointPool.push({
                active: false,
                x: 0, y: 0, color: '', intensity: 0,
                timestamp: 0, life: 0
            });
        }
    }
    
    getParticleFromPool() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return null; // プール枯渇時
    }
    
    returnParticleToPool(particle) {
        particle.active = false;
    }
    
    getTrailPointFromPool() {
        for (let point of this.trailPointPool) {
            if (!point.active) {
                point.active = true;
                return point;
            }
        }
        return null;
    }
    
    returnTrailPointToPool(point) {
        point.active = false;
    }
    
    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 最適化されたCanvas設定
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // ImageDataの事前割り当て（必要に応じて）
        this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // 高DPI対応の最適化
        this.canvas.width = rect.width * Math.min(dpr, 2); // DPRを制限
        this.canvas.height = rect.height * Math.min(dpr, 2);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(Math.min(dpr, 2), Math.min(dpr, 2));
    }
    
    initSystems() {
        // 最適化されたシステム初期化
        this.trailSystem = new OptimizedLuminousTrailSystem(this.ctx, this);
        this.particleSystem = new OptimizedMorphingParticleSystem(this.ctx, this);
        this.colorSystem = new TemporalColorSystem();
        
        this.settings = {
            intensity: 1.0,
            particleSize: 1.0,
            trailMode: true,
            maxParticles: 500,
            qualityMode: 'auto' // auto, high, medium, low
        };
    }
    
    initEventListeners() {
        // 最適化されたイベントハンドリング（throttling）
        let lastMouseUpdate = 0;
        const throttleInterval = 16; // ~60fps
        
        const throttledMouseMove = (e) => {
            const now = Date.now();
            if (now - lastMouseUpdate > throttleInterval) {
                this.handleMouseMove(e);
                lastMouseUpdate = now;
            }
        };
        
        this.canvas.addEventListener('mousemove', throttledMouseMove);
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // タッチイベント（最適化版）
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            throttledMouseMove(e.touches[0]);
        }, { passive: false });
        
        // キーボードショートカット
        this.initControlListeners();
    }
    
    initControlListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'c':
                    this.clearCanvas();
                    break;
                case '1':
                    this.settings.qualityMode = 'high';
                    break;
                case '2':
                    this.settings.qualityMode = 'medium';
                    break;
                case '3':
                    this.settings.qualityMode = 'low';
                    break;
                case ' ':
                    e.preventDefault();
                    this.saveCanvas();
                    break;
            }
        });
        
        // マウスホイールでの強度調整
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.ctrlKey) {
                this.settings.particleSize = Math.max(0.1, Math.min(3.0, 
                    this.settings.particleSize + e.deltaY * -0.01));
            } else {
                this.settings.intensity = Math.max(0.1, Math.min(3.0, 
                    this.settings.intensity + e.deltaY * -0.01));
            }
        });
    }
    
    handleMouseMove(e) {
        this.updateMousePosition(e.clientX, e.clientY);
        this.calculateMouseVelocity();
        
        if (this.isDrawing || this.settings.trailMode) {
            this.createOptimizedEffects();
        }
    }
    
    handleMouseDown(e) {
        this.isDrawing = true;
        this.updateMousePosition(e.clientX, e.clientY);
    }
    
    handleMouseUp(e) {
        this.isDrawing = false;
    }
    
    handleMouseLeave(e) {
        this.isDrawing = false;
    }
    
    updateMousePosition(x, y) {
        this.mouse.prevX = this.mouse.x;
        this.mouse.prevY = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;
    }
    
    calculateMouseVelocity() {
        const dx = this.mouse.x - this.mouse.prevX;
        const dy = this.mouse.y - this.mouse.prevY;
        this.mouse.velocity = Math.sqrt(dx * dx + dy * dy);
    }
    
    createOptimizedEffects() {
        const currentColor = this.colorSystem.getCurrentColor(this.mouse);
        const qualityMultiplier = this.getQualityMultiplier();
        
        // 品質に基づいて生成数を調整
        if (this.settings.trailMode) {
            this.trailSystem.addTrailPoint(
                this.mouse.x, 
                this.mouse.y, 
                currentColor, 
                this.settings.intensity * qualityMultiplier
            );
        }
        
        this.particleSystem.addParticles(
            this.mouse.x, 
            this.mouse.y, 
            this.mouse.velocity, 
            currentColor, 
            this.settings.particleSize * qualityMultiplier
        );
    }
    
    getQualityMultiplier() {
        if (this.settings.qualityMode === 'auto') {
            return this.performance.qualityLevel;
        }
        
        const qualityMap = {
            'high': 1.0,
            'medium': 0.7,
            'low': 0.4
        };
        
        return qualityMap[this.settings.qualityMode] || 1.0;
    }
    
    startOptimizedAnimation() {
        let lastTime = 0;
        
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // FPS監視と動的品質調整
            this.updatePerformanceMetrics(deltaTime);
            
            // アダプティブ品質制御
            if (this.performance.adaptiveQuality) {
                this.adjustQualityBasedOnPerformance();
            }
            
            this.update(currentTime, deltaTime);
            this.render();
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    updatePerformanceMetrics(deltaTime) {
        this.performance.frameCount++;
        
        if (deltaTime > 0) {
            const currentFps = 1000 / deltaTime;
            this.performance.fps = this.performance.fps * 0.9 + currentFps * 0.1; // 移動平均
        }
    }
    
    adjustQualityBasedOnPerformance() {
        const targetFps = this.performance.targetFps;
        const currentFps = this.performance.fps;
        
        if (currentFps < targetFps * 0.8) {
            // FPSが低い場合、品質を下げる
            this.performance.qualityLevel = Math.max(0.3, this.performance.qualityLevel - 0.05);
        } else if (currentFps > targetFps * 0.95) {
            // FPSが十分高い場合、品質を上げる
            this.performance.qualityLevel = Math.min(1.0, this.performance.qualityLevel + 0.02);
        }
    }
    
    update(timestamp, deltaTime) {
        // バッチ更新で効率化
        this.trailSystem.batchUpdate(timestamp, deltaTime);
        this.particleSystem.batchUpdate(timestamp, deltaTime);
        this.colorSystem.update(timestamp);
    }
    
    render() {
        // 最適化されたレンダリング
        const qualityLevel = this.getQualityMultiplier();
        
        // 背景フェード（品質に応じて調整）
        const fadeAlpha = 0.02 + (1 - qualityLevel) * 0.03;
        this.ctx.fillStyle = `rgba(12, 12, 12, ${fadeAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // システムレンダリング
        this.trailSystem.render(qualityLevel);
        this.particleSystem.render(qualityLevel);
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.trailSystem.clear();
        this.particleSystem.clear();
        
        // プールの清理
        this.particlePool.forEach(p => p.active = false);
        this.trailPointPool.forEach(p => p.active = false);
    }
    
    saveCanvas() {
        const link = document.createElement('a');
        link.download = `interactive-art-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    getPerformanceStats() {
        return {
            fps: Math.round(this.performance.fps),
            qualityLevel: this.performance.qualityLevel,
            particleCount: this.particleSystem.getActiveParticleCount(),
            trailPoints: this.trailSystem.getActiveTrailPointCount(),
            poolUtilization: {
                particles: (this.particlePool.filter(p => p.active).length / this.poolSize * 100).toFixed(1) + '%',
                trailPoints: (this.trailPointPool.filter(p => p.active).length / this.poolSize * 100).toFixed(1) + '%'
            }
        };
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // イベントリスナーの削除
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        // ... 他のイベントリスナーも削除
    }
}

// 最適化されたトレイルシステム（簡素版）
class OptimizedLuminousTrailSystem {
    constructor(ctx, app) {
        this.ctx = ctx;
        this.app = app;
        this.activeTrailPoints = [];
    }
    
    addTrailPoint(x, y, color, intensity) {
        const point = this.app.getTrailPointFromPool();
        if (point) {
            point.x = x;
            point.y = y;
            point.color = color;
            point.intensity = intensity;
            point.timestamp = Date.now();
            point.life = 1.0;
            this.activeTrailPoints.push(point);
        }
    }
    
    batchUpdate(timestamp, deltaTime) {
        this.activeTrailPoints = this.activeTrailPoints.filter(point => {
            const age = timestamp - point.timestamp;
            point.life = Math.max(0, 1 - age / 2000);
            
            if (point.life <= 0) {
                this.app.returnTrailPointToPool(point);
                return false;
            }
            return true;
        });
    }
    
    render(qualityLevel) {
        if (this.activeTrailPoints.length < 2) return;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        const step = Math.max(1, Math.floor(3 / qualityLevel));
        
        for (let i = step; i < this.activeTrailPoints.length; i += step) {
            const current = this.activeTrailPoints[i];
            const previous = this.activeTrailPoints[i - step];
            
            if (current.life > 0 && previous.life > 0) {
                const alpha = Math.min(current.life, previous.life) * 0.5;
                this.ctx.strokeStyle = current.color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
                this.ctx.lineWidth = 1 + current.intensity * 2 * qualityLevel;
                
                this.ctx.beginPath();
                this.ctx.moveTo(previous.x, previous.y);
                this.ctx.lineTo(current.x, current.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    clear() {
        this.activeTrailPoints.forEach(point => this.app.returnTrailPointToPool(point));
        this.activeTrailPoints = [];
    }
    
    getActiveTrailPointCount() {
        return this.activeTrailPoints.length;
    }
}

// 最適化されたパーティクルシステム（簡素版）
class OptimizedMorphingParticleSystem {
    constructor(ctx, app) {
        this.ctx = ctx;
        this.app = app;
        this.activeParticles = [];
    }
    
    addParticles(x, y, velocity, color, sizeMultiplier) {
        const count = Math.floor((2 + velocity * 0.1) * this.app.getQualityMultiplier());
        
        for (let i = 0; i < count; i++) {
            const particle = this.app.getParticleFromPool();
            if (particle) {
                const angle = (Math.PI * 2 * i) / count;
                particle.x = x + Math.cos(angle) * 10;
                particle.y = y + Math.sin(angle) * 10;
                particle.vx = Math.cos(angle) * velocity * 0.1;
                particle.vy = Math.sin(angle) * velocity * 0.1;
                particle.size = (2 + Math.random() * 3) * sizeMultiplier;
                particle.life = 1.0;
                particle.maxLife = 60 + Math.random() * 120;
                particle.color = this.parseColor(color);
                this.activeParticles.push(particle);
            }
        }
    }
    
    parseColor(colorString) {
        const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        return match ? { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) } : { h: 0, s: 50, l: 50 };
    }
    
    batchUpdate(timestamp, deltaTime) {
        this.activeParticles = this.activeParticles.filter(particle => {
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            particle.maxLife--;
            particle.life = particle.maxLife / 180;
            
            if (particle.maxLife <= 0) {
                this.app.returnParticleToPool(particle);
                return false;
            }
            return true;
        });
    }
    
    render(qualityLevel) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        const step = Math.max(1, Math.floor(2 / qualityLevel));
        
        for (let i = 0; i < this.activeParticles.length; i += step) {
            const particle = this.activeParticles[i];
            if (particle.life > 0) {
                const alpha = particle.life * 0.8;
                const color = `hsla(${particle.color.h}, ${particle.color.s}%, ${particle.color.l}%, ${alpha})`;
                
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    clear() {
        this.activeParticles.forEach(particle => this.app.returnParticleToPool(particle));
        this.activeParticles = [];
    }
    
    getActiveParticleCount() {
        return this.activeParticles.length;
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.optimizedArtGenerator = new OptimizedInteractiveArtGenerator();
});