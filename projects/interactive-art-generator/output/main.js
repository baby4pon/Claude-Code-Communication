// Interactive Art Generator - メインアプリケーション
class InteractiveArtGenerator {
    constructor() {
        this.canvas = document.getElementById('artCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, velocity: 0 };
        this.isDrawing = false;
        this.animationFrame = null;
        
        // システム初期化
        this.initCanvas();
        this.initSystems();
        this.initEventListeners();
        this.startAnimation();
        
        console.log('Interactive Art Generator initialized');
    }
    
    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Canvas設定
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initSystems() {
        // 各システムの初期化
        this.trailSystem = new LuminousTrailSystem(this.ctx);
        this.particleSystem = new MorphingParticleSystem(this.ctx);
        this.colorSystem = new TemporalColorSystem();
        
        // 設定の初期化
        this.settings = {
            intensity: 1.0,
            particleSize: 1.0,
            trailMode: true
        };
    }
    
    initEventListeners() {
        // マウスイベント
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // タッチイベント（モバイル対応）
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // コントロールイベント
        this.initControlListeners();
    }
    
    initControlListeners() {
        const intensitySlider = document.getElementById('intensitySlider');
        const sizeSlider = document.getElementById('sizeSlider');
        const trailModeCheckbox = document.getElementById('trailMode');
        const clearButton = document.getElementById('clearCanvas');
        
        intensitySlider?.addEventListener('input', (e) => {
            this.settings.intensity = parseFloat(e.target.value);
        });
        
        sizeSlider?.addEventListener('input', (e) => {
            this.settings.particleSize = parseFloat(e.target.value);
        });
        
        trailModeCheckbox?.addEventListener('change', (e) => {
            this.settings.trailMode = e.target.checked;
        });
        
        clearButton?.addEventListener('click', () => {
            this.clearCanvas();
        });
    }
    
    handleMouseMove(e) {
        this.updateMousePosition(e.clientX, e.clientY);
        this.calculateMouseVelocity();
        
        if (this.isDrawing || this.settings.trailMode) {
            this.createEffects();
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
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.updateMousePosition(touch.clientX, touch.clientY);
        this.calculateMouseVelocity();
        this.createEffects();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.isDrawing = true;
        const touch = e.touches[0];
        this.updateMousePosition(touch.clientX, touch.clientY);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
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
    
    createEffects() {
        const currentColor = this.colorSystem.getCurrentColor(this.mouse);
        
        // 光の軌跡エフェクト
        if (this.settings.trailMode) {
            this.trailSystem.addTrailPoint(
                this.mouse.x, 
                this.mouse.y, 
                currentColor, 
                this.settings.intensity
            );
        }
        
        // パーティクルエフェクト
        this.particleSystem.addParticles(
            this.mouse.x, 
            this.mouse.y, 
            this.mouse.velocity, 
            currentColor, 
            this.settings.particleSize
        );
    }
    
    startAnimation() {
        const animate = (timestamp) => {
            this.update(timestamp);
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    update(timestamp) {
        // システムアップデート
        this.trailSystem.update(timestamp);
        this.particleSystem.update(timestamp);
        this.colorSystem.update(timestamp);
    }
    
    render() {
        // 背景のフェード効果（軌跡の残像）
        this.ctx.fillStyle = 'rgba(12, 12, 12, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 各システムのレンダリング
        this.trailSystem.render();
        this.particleSystem.render();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.trailSystem.clear();
        this.particleSystem.clear();
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.artGenerator = new InteractiveArtGenerator();
});