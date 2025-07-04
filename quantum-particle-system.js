// 量子共鳴パーティクル実装
class QuantumParticle {
    constructor(x, y, id) {
        this.id = id;
        this.position = { x, y };
        this.targetPosition = { x, y };
        this.velocity = { x: 0, y: 0 };
        
        // 量子状態パラメータ
        this.probabilityCloud = new Float32Array(64); // 確率分布グリッド
        this.waveAmplitude = 1.0;
        this.frequency = 0.1 + Math.random() * 0.05;
        this.phase = Math.random() * Math.PI * 2;
        this.sigma = 20; // 波動関数の広がり
        this.collapsed = false;
        this.collapseTime = 0;
        
        // 視覚効果
        this.alpha = 1.0;
        this.size = 2 + Math.random() * 3;
        this.color = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        };
        
        this.initializeProbabilityCloud();
    }
    
    initializeProbabilityCloud() {
        // 8x8グリッドの確率分布を初期化
        for (let i = 0; i < 64; i++) {
            const x = (i % 8) - 4;
            const y = Math.floor(i / 8) - 4;
            const distance = Math.sqrt(x * x + y * y);
            this.probabilityCloud[i] = Math.exp(-distance * distance / (2 * this.sigma * this.sigma));
        }
    }
    
    updateQuantumState(deltaTime) {
        this.phase += this.frequency * deltaTime;
        
        if (!this.collapsed) {
            // 重ね合わせ状態での確率的位置更新
            this.updateProbabilityDistribution(deltaTime);
            
            // 観測による収束判定
            if (Math.random() < 0.001) { // 0.1%の確率で収束
                this.collapse();
            }
        } else {
            // 収束後の古典的運動
            this.updateClassicalMotion(deltaTime);
        }
    }
    
    updateProbabilityDistribution(deltaTime) {
        // 波動関数の時間発展
        const waveFunction = (x, y) => {
            const dx = x - this.position.x;
            const dy = y - this.position.y;
            const r2 = dx * dx + dy * dy;
            return Math.exp(-r2 / (2 * this.sigma * this.sigma)) * 
                   Math.cos(this.frequency * deltaTime + this.phase);
        };
        
        // 確率分布の更新
        for (let i = 0; i < 64; i++) {
            const gridX = (i % 8) - 4;
            const gridY = Math.floor(i / 8) - 4;
            const worldX = this.position.x + gridX * 10;
            const worldY = this.position.y + gridY * 10;
            
            const wave = waveFunction(worldX, worldY);
            this.probabilityCloud[i] = Math.abs(wave) * Math.abs(wave);
        }
        
        // 確率的位置の計算
        let totalProbability = 0;
        let weightedX = 0;
        let weightedY = 0;
        
        for (let i = 0; i < 64; i++) {
            const gridX = (i % 8) - 4;
            const gridY = Math.floor(i / 8) - 4;
            const prob = this.probabilityCloud[i];
            
            totalProbability += prob;
            weightedX += gridX * prob;
            weightedY += gridY * prob;
        }
        
        if (totalProbability > 0) {
            this.position.x += (weightedX / totalProbability) * 0.1;
            this.position.y += (weightedY / totalProbability) * 0.1;
        }
    }
    
    collapse() {
        this.collapsed = true;
        this.collapseTime = performance.now();
        
        // 収束位置の決定
        let maxProbability = 0;
        let collapseIndex = 0;
        
        for (let i = 0; i < 64; i++) {
            if (this.probabilityCloud[i] > maxProbability) {
                maxProbability = this.probabilityCloud[i];
                collapseIndex = i;
            }
        }
        
        const gridX = (collapseIndex % 8) - 4;
        const gridY = Math.floor(collapseIndex / 8) - 4;
        this.position.x += gridX * 10;
        this.position.y += gridY * 10;
    }
    
    updateClassicalMotion(deltaTime) {
        // 古典的な運動方程式
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const force = 0.05;
            this.velocity.x += (dx / distance) * force;
            this.velocity.y += (dy / distance) * force;
        }
        
        // 速度制限とダンピング
        const maxVelocity = 5;
        const velocityMag = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (velocityMag > maxVelocity) {
            this.velocity.x = (this.velocity.x / velocityMag) * maxVelocity;
            this.velocity.y = (this.velocity.y / velocityMag) * maxVelocity;
        }
        
        this.velocity.x *= 0.98; // ダンピング
        this.velocity.y *= 0.98;
        
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }
    
    render(ctx) {
        if (!this.collapsed) {
            this.renderQuantumCloud(ctx);
        } else {
            this.renderClassicalParticle(ctx);
        }
    }
    
    renderQuantumCloud(ctx) {
        // 確率雲の描画
        ctx.save();
        
        for (let i = 0; i < 64; i++) {
            const gridX = (i % 8) - 4;
            const gridY = Math.floor(i / 8) - 4;
            const worldX = this.position.x + gridX * 10;
            const worldY = this.position.y + gridY * 10;
            const probability = this.probabilityCloud[i];
            
            if (probability > 0.01) {
                const alpha = Math.min(probability * 2, 1.0);
                const size = this.size * (0.5 + probability);
                
                ctx.beginPath();
                ctx.arc(worldX, worldY, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.3})`;
                ctx.fill();
                
                // 波動効果のリング
                ctx.beginPath();
                ctx.arc(worldX, worldY, size * 2, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.1})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    renderClassicalParticle(ctx) {
        ctx.save();
        
        // メインパーティクル
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.fill();
        
        // 収束エフェクト
        const timeSinceCollapse = (performance.now() - this.collapseTime) / 1000;
        if (timeSinceCollapse < 1) {
            const effectRadius = this.size * (1 + timeSinceCollapse * 5);
            const effectAlpha = Math.max(0, 1 - timeSinceCollapse);
            
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, effectRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${effectAlpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// 量子パーティクルシステム
class QuantumParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 1000; // 1000粒子でテスト
        this.lastTime = performance.now();
        
        this.initializeParticles();
        this.animate();
    }
    
    initializeParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.particles.push(new QuantumParticle(x, y, i));
        }
    }
    
    update(deltaTime) {
        for (let particle of this.particles) {
            particle.updateQuantumState(deltaTime);
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景を黒に設定
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let particle of this.particles) {
            particle.render(this.ctx);
        }
        
        // パフォーマンス情報の表示
        this.renderPerformanceInfo();
    }
    
    renderPerformanceInfo() {
        const fps = Math.round(1000 / (performance.now() - this.lastTime));
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`FPS: ${fps}`, 10, 30);
        this.ctx.fillText(`Particles: ${this.particleCount}`, 10, 50);
        this.ctx.fillText(`Quantum Particles: ${this.particles.filter(p => !p.collapsed).length}`, 10, 70);
    }
    
    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    // 文字形成機能
    formText(text, x, y) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 100;
        
        ctx.font = '48px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, 0, 60);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let targetIndex = 0;
        for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
                const index = (y * canvas.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if (alpha > 128 && targetIndex < this.particles.length) {
                    this.particles[targetIndex].targetPosition.x = x * 2 + 100;
                    this.particles[targetIndex].targetPosition.y = y * 2 + 100;
                    targetIndex++;
                }
            }
        }
    }
}

// 使用例
/*
const canvas = document.getElementById('quantum-canvas');
const system = new QuantumParticleSystem(canvas);

// 3秒後に文字を形成
setTimeout(() => {
    system.formText('QUANTUM', 0, 0);
}, 3000);
*/