// フラクタル爆発エンジン実装
class FractalExplosionEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.explosions = [];
        this.particlePool = [];
        this.maxParticles = 2000;
        this.activeParticles = 0;
        
        this.initializeParticlePool();
    }
    
    initializeParticlePool() {
        // パーティクルプールの初期化
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(new FractalParticle());
        }
    }
    
    createExplosion(x, y, power = 1.0, depth = 0, maxDepth = 3) {
        const explosion = new FractalExplosion(x, y, power, depth, maxDepth, this);
        this.explosions.push(explosion);
        return explosion;
    }
    
    getParticleFromPool() {
        if (this.activeParticles < this.maxParticles) {
            const particle = this.particlePool[this.activeParticles];
            this.activeParticles++;
            return particle;
        }
        return null;
    }
    
    returnParticleToPool(particle) {
        if (this.activeParticles > 0) {
            this.activeParticles--;
            // パーティクルをプールの最後に移動
            const lastIndex = this.activeParticles;
            const lastParticle = this.particlePool[lastIndex];
            this.particlePool[lastIndex] = particle;
            this.particlePool[this.particlePool.indexOf(particle)] = lastParticle;
        }
    }
    
    update(deltaTime) {
        // 爆発の更新
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.update(deltaTime);
            
            if (explosion.isComplete()) {
                this.explosions.splice(i, 1);
            }
        }
        
        // アクティブパーティクルの更新
        for (let i = 0; i < this.activeParticles; i++) {
            this.particlePool[i].update(deltaTime);
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景を黒に設定
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 爆発の描画
        for (let explosion of this.explosions) {
            explosion.render(this.ctx);
        }
        
        // パーティクルの描画
        for (let i = 0; i < this.activeParticles; i++) {
            this.particlePool[i].render(this.ctx);
        }
        
        // パフォーマンス情報
        this.renderPerformanceInfo();
    }
    
    renderPerformanceInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Active Particles: ${this.activeParticles}`, 10, 30);
        this.ctx.fillText(`Active Explosions: ${this.explosions.length}`, 10, 50);
    }
}

class FractalExplosion {
    constructor(x, y, power, depth, maxDepth, engine) {
        this.x = x;
        this.y = y;
        this.power = power;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.engine = engine;
        
        this.particles = [];
        this.childExplosions = [];
        this.age = 0;
        this.lifespan = 2.0 + Math.random() * 3.0;
        this.complete = false;
        
        this.generateFractalPattern();
    }
    
    generateFractalPattern() {
        const particleCount = Math.floor(50 * this.power * (1 - this.depth / this.maxDepth));
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.engine.getParticleFromPool();
            if (particle) {
                const angle = (i / particleCount) * Math.PI * 2;
                const mandelbrotValue = this.calculateMandelbrotValue(angle);
                const distance = 20 + mandelbrotValue * 100 * this.power;
                
                particle.reset(
                    this.x + Math.cos(angle) * distance,
                    this.y + Math.sin(angle) * distance,
                    Math.cos(angle) * distance * 0.1,
                    Math.sin(angle) * distance * 0.1,
                    this.getColorFromMandelbrot(mandelbrotValue),
                    1.0 + mandelbrotValue * 2
                );
                
                this.particles.push(particle);
            }
        }
        
        // 子爆発の生成（フラクタル再帰）
        if (this.depth < this.maxDepth) {
            const childCount = Math.floor(3 + Math.random() * 5);
            for (let i = 0; i < childCount; i++) {
                const angle = (i / childCount) * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                const childX = this.x + Math.cos(angle) * distance;
                const childY = this.y + Math.sin(angle) * distance;
                
                setTimeout(() => {
                    if (!this.complete) {
                        this.childExplosions.push(
                            this.engine.createExplosion(
                                childX, childY, 
                                this.power * 0.6, 
                                this.depth + 1, 
                                this.maxDepth
                            )
                        );
                    }
                }, 500 + Math.random() * 1000);
            }
        }
    }
    
    calculateMandelbrotValue(angle) {
        // 複素数平面での計算
        const c = {
            real: Math.cos(angle) * 0.5,
            imag: Math.sin(angle) * 0.5
        };
        
        let z = { real: 0, imag: 0 };
        let iterations = 0;
        const maxIterations = 50;
        
        while (iterations < maxIterations) {
            const zReal = z.real * z.real - z.imag * z.imag + c.real;
            const zImag = 2 * z.real * z.imag + c.imag;
            
            z.real = zReal;
            z.imag = zImag;
            
            if (z.real * z.real + z.imag * z.imag > 4) {
                break;
            }
            iterations++;
        }
        
        return iterations / maxIterations;
    }
    
    getColorFromMandelbrot(value) {
        // フラクタル値に基づくカラーマッピング
        const hue = value * 360;
        const saturation = 70 + value * 30;
        const lightness = 50 + value * 50;
        
        return this.hslToRgb(hue, saturation, lightness);
    }
    
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (0 <= h && h < 1/6) {
            r = c; g = x; b = 0;
        } else if (1/6 <= h && h < 2/6) {
            r = x; g = c; b = 0;
        } else if (2/6 <= h && h < 3/6) {
            r = 0; g = c; b = x;
        } else if (3/6 <= h && h < 4/6) {
            r = 0; g = x; b = c;
        } else if (4/6 <= h && h < 5/6) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        // パーティクルの更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.engine.returnParticleToPool(particle);
                this.particles.splice(i, 1);
            }
        }
        
        // 完了判定
        if (this.age > this.lifespan && this.particles.length === 0) {
            this.complete = true;
        }
    }
    
    render(ctx) {
        // 中心部の光る効果
        if (this.age < 0.5) {
            const alpha = 1 - (this.age / 0.5);
            const radius = (this.age / 0.5) * 30;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
            ctx.restore();
        }
    }
    
    isComplete() {
        return this.complete;
    }
}

class FractalParticle {
    constructor() {
        this.reset(0, 0, 0, 0, {r: 255, g: 255, b: 255}, 1);
    }
    
    reset(x, y, vx, vy, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.initialSize = size;
        this.life = 1.0;
        this.lifespan = 2.0 + Math.random() * 3.0;
        this.gravity = 0.1;
        this.drag = 0.98;
        this.dead = false;
        
        // フラクタル固有の効果
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 2 + Math.random() * 3;
    }
    
    update(deltaTime) {
        if (this.dead) return;
        
        // 物理更新
        this.vy += this.gravity * deltaTime;
        this.vx *= this.drag;
        this.vy *= this.drag;
        
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
        
        // 回転とパルス効果
        this.rotation += this.rotationSpeed * deltaTime;
        this.pulsePhase += this.pulseSpeed * deltaTime;
        
        // ライフタイム管理
        this.life -= deltaTime / this.lifespan;
        if (this.life <= 0) {
            this.dead = true;
        }
        
        // サイズの変化
        this.size = this.initialSize * (0.5 + Math.sin(this.pulsePhase) * 0.5) * this.life;
    }
    
    render(ctx) {
        if (this.dead || this.life <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        
        // メインパーティクル
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life})`;
        ctx.fill();
        
        // 光る効果
        if (this.life > 0.5) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${(this.life - 0.5) * 0.3})`;
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    isDead() {
        return this.dead;
    }
}

// 使用例
/*
const canvas = document.getElementById('fractal-canvas');
const engine = new FractalExplosionEngine(canvas);

// アニメーションループ
function animate() {
    engine.update(0.016); // 60FPS
    engine.render();
    requestAnimationFrame(animate);
}
animate();

// マウスクリックで爆発を生成
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engine.createExplosion(x, y, 1.0, 0, 3);
});
*/