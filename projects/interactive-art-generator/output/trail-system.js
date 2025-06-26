// Luminous Trail System - 光る軌跡エフェクトシステム
class LuminousTrailSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.trailPoints = [];
        this.particles = [];
        this.maxTrailPoints = 200;
        this.maxParticles = 1000;
        
        // 物理パラメータ
        this.gravity = 0.02;
        this.wind = { x: 0.01, y: -0.005 };
        this.friction = 0.98;
        
        console.log('Luminous Trail System initialized');
    }
    
    addTrailPoint(x, y, color, intensity = 1.0) {
        // 軌跡ポイントの追加
        const trailPoint = {
            x, y,
            color: color,
            intensity: intensity,
            timestamp: Date.now(),
            life: 1.0
        };
        
        this.trailPoints.push(trailPoint);
        
        // 軌跡ポイントの上限管理
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
        
        // 光粒子の生成
        this.spawnLightParticles(x, y, color, intensity);
    }
    
    spawnLightParticles(x, y, color, intensity) {
        const particleCount = Math.floor(5 + intensity * 10);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.5 + Math.random() * 2.0 * intensity;
            const size = 2 + Math.random() * 4 * intensity;
            
            const particle = {
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
                vy: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
                size: size,
                initialSize: size,
                life: 1.0,
                maxLife: 60 + Math.random() * 120, // フレーム数
                color: this.parseColor(color),
                brightness: 0.8 + Math.random() * 0.2,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.1 + Math.random() * 0.2
            };
            
            this.particles.push(particle);
        }
        
        // パーティクル数の上限管理
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }
    
    parseColor(colorString) {
        // HSL色文字列をパースして数値に変換
        const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            return {
                h: parseInt(match[1]),
                s: parseInt(match[2]),
                l: parseInt(match[3])
            };
        }
        return { h: 0, s: 50, l: 50 }; // デフォルト色
    }
    
    update(timestamp) {
        this.updateTrailPoints(timestamp);
        this.updateParticles(timestamp);
    }
    
    updateTrailPoints(timestamp) {
        this.trailPoints = this.trailPoints.filter(point => {
            const age = timestamp - point.timestamp;
            const maxAge = 3000; // 3秒
            point.life = Math.max(0, 1 - age / maxAge);
            return point.life > 0;
        });
    }
    
    updateParticles(timestamp) {
        this.particles = this.particles.filter(particle => {
            // 物理シミュレーション
            particle.vx += this.wind.x;
            particle.vy += this.wind.y + this.gravity;
            particle.vx *= this.friction;
            particle.vy *= this.friction;
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // ライフサイクル管理
            particle.maxLife--;
            particle.life = particle.maxLife / (60 + 120); // 正規化されたライフ
            
            // サイズとブライトネスの更新
            particle.size = particle.initialSize * particle.life;
            particle.brightness = (0.8 + Math.random() * 0.2) * particle.life;
            
            // 瞬き効果
            particle.twinkle += particle.twinkleSpeed;
            
            return particle.maxLife > 0 && particle.life > 0;
        });
    }
    
    render() {
        this.renderTrailLines();
        this.renderLightParticles();
    }
    
    renderTrailLines() {
        if (this.trailPoints.length < 2) return;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 1; i < this.trailPoints.length; i++) {
            const current = this.trailPoints[i];
            const previous = this.trailPoints[i - 1];
            
            if (current.life <= 0 || previous.life <= 0) continue;
            
            // グラデーション作成
            const gradient = this.ctx.createLinearGradient(
                previous.x, previous.y, current.x, current.y
            );
            
            const alpha = Math.min(current.life, previous.life) * 0.5;
            gradient.addColorStop(0, this.colorWithAlpha(previous.color, alpha * previous.life));
            gradient.addColorStop(1, this.colorWithAlpha(current.color, alpha * current.life));
            
            // 線の描画
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2 + current.intensity * 3;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(previous.x, previous.y);
            this.ctx.lineTo(current.x, current.y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    renderLightParticles() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        this.particles.forEach(particle => {
            if (particle.life <= 0) return;
            
            const alpha = particle.brightness * Math.sin(particle.twinkle) * 0.5 + 0.5;
            const color = this.hslToRgba(
                particle.color.h,
                particle.color.s,
                particle.color.l,
                alpha * particle.life
            );
            
            // グロー効果
            const glowSize = particle.size * 3;
            const glowGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, glowSize
            );
            glowGradient.addColorStop(0, color);
            glowGradient.addColorStop(0.3, this.colorWithAlpha(color, alpha * 0.3));
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // コア部分
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }
    
    colorWithAlpha(colorString, alpha) {
        if (colorString.startsWith('hsl')) {
            const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                return `hsla(${match[1]}, ${match[2]}%, ${match[3]}%, ${alpha})`;
            }
        }
        return `rgba(255, 255, 255, ${alpha})`;
    }
    
    hslToRgba(h, s, l, a) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }
    
    clear() {
        this.trailPoints = [];
        this.particles = [];
    }
    
    // パフォーマンス統計
    getStats() {
        return {
            trailPoints: this.trailPoints.length,
            particles: this.particles.length,
            activeTrailPoints: this.trailPoints.filter(p => p.life > 0).length,
            activeParticles: this.particles.filter(p => p.life > 0).length
        };
    }
}