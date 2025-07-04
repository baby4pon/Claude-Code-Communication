// 流体力学シミュレーション実装（SPHアルゴリズム）
class FluidParticle {
    constructor(x, y, id) {
        this.id = id;
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.previousPosition = { x, y };
        
        // SPH物理パラメータ
        this.mass = 1.0;
        this.density = 1000.0; // kg/m³
        this.pressure = 0.0;
        this.restDensity = 1000.0;
        this.viscosity = 0.01;
        this.gasConstant = 2000.0;
        this.surfaceTension = 0.1;
        
        // 近傍パーティクル管理
        this.neighbors = [];
        this.neighborDistances = [];
        this.maxNeighbors = 50;
        this.smoothingRadius = 20.0;
        this.smoothingRadiusSq = this.smoothingRadius * this.smoothingRadius;
        
        // 視覚効果
        this.color = {
            r: 50 + Math.random() * 100,
            g: 100 + Math.random() * 100,
            b: 200 + Math.random() * 55
        };
        this.size = 3 + Math.random() * 2;
        this.alpha = 1.0;
        
        // 表面検出
        this.isSurfaceParticle = false;
        this.colorField = 0;
        this.colorFieldGradient = { x: 0, y: 0 };
        this.colorFieldLaplacian = 0;
    }
    
    reset(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.density = this.restDensity;
        this.pressure = 0;
        this.neighbors.length = 0;
        this.neighborDistances.length = 0;
    }
    
    // カーネル関数（Poly6）
    kernelPoly6(r, h) {
        if (r >= h) return 0;
        const diff = h * h - r * r;
        return (315 / (64 * Math.PI * Math.pow(h, 9))) * Math.pow(diff, 3);
    }
    
    // カーネル勾配関数（Spiky）
    kernelSpikyGradient(r, h) {
        if (r >= h || r === 0) return { x: 0, y: 0 };
        const diff = h - r;
        const coeff = -45 / (Math.PI * Math.pow(h, 6)) * Math.pow(diff, 2);
        return { x: coeff, y: coeff };
    }
    
    // 粘性カーネル関数
    kernelViscosityLaplacian(r, h) {
        if (r >= h) return 0;
        return (45 / (Math.PI * Math.pow(h, 6))) * (h - r);
    }
    
    // 近傍パーティクル検索
    findNeighbors(particles, spatialGrid) {
        this.neighbors.length = 0;
        this.neighborDistances.length = 0;
        
        const gridX = Math.floor(this.position.x / this.smoothingRadius);
        const gridY = Math.floor(this.position.y / this.smoothingRadius);
        
        // 周囲9つのセルを検索
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cellX = gridX + dx;
                const cellY = gridY + dy;
                const cellKey = `${cellX},${cellY}`;
                
                if (spatialGrid[cellKey]) {
                    for (let otherId of spatialGrid[cellKey]) {
                        if (otherId === this.id) continue;
                        
                        const other = particles[otherId];
                        const dx = this.position.x - other.position.x;
                        const dy = this.position.y - other.position.y;
                        const distanceSq = dx * dx + dy * dy;
                        
                        if (distanceSq < this.smoothingRadiusSq) {
                            const distance = Math.sqrt(distanceSq);
                            this.neighbors.push(other);
                            this.neighborDistances.push(distance);
                        }
                    }
                }
            }
        }
    }
    
    // 密度計算
    calculateDensity() {
        this.density = this.mass * this.kernelPoly6(0, this.smoothingRadius);
        
        for (let i = 0; i < this.neighbors.length; i++) {
            const neighbor = this.neighbors[i];
            const distance = this.neighborDistances[i];
            this.density += neighbor.mass * this.kernelPoly6(distance, this.smoothingRadius);
        }
    }
    
    // 圧力計算
    calculatePressure() {
        this.pressure = this.gasConstant * (this.density - this.restDensity);
        this.pressure = Math.max(0, this.pressure); // 負圧を防止
    }
    
    // 圧力力計算
    calculatePressureForce() {
        const force = { x: 0, y: 0 };
        
        for (let i = 0; i < this.neighbors.length; i++) {
            const neighbor = this.neighbors[i];
            const distance = this.neighborDistances[i];
            
            if (distance === 0) continue;
            
            const dx = this.position.x - neighbor.position.x;
            const dy = this.position.y - neighbor.position.y;
            const direction = { x: dx / distance, y: dy / distance };
            
            const pressureContribution = (this.pressure + neighbor.pressure) / (2 * neighbor.density);
            const kernelGradient = this.kernelSpikyGradient(distance, this.smoothingRadius);
            
            force.x -= neighbor.mass * pressureContribution * kernelGradient.x * direction.x;
            force.y -= neighbor.mass * pressureContribution * kernelGradient.y * direction.y;
        }
        
        return force;
    }
    
    // 粘性力計算
    calculateViscosityForce() {
        const force = { x: 0, y: 0 };
        
        for (let i = 0; i < this.neighbors.length; i++) {
            const neighbor = this.neighbors[i];
            const distance = this.neighborDistances[i];
            
            const velocityDiff = {
                x: neighbor.velocity.x - this.velocity.x,
                y: neighbor.velocity.y - this.velocity.y
            };
            
            const viscosityContribution = this.viscosity * neighbor.mass * 
                this.kernelViscosityLaplacian(distance, this.smoothingRadius) / neighbor.density;
            
            force.x += viscosityContribution * velocityDiff.x;
            force.y += viscosityContribution * velocityDiff.y;
        }
        
        return force;
    }
    
    // 表面張力計算
    calculateSurfaceTension() {
        // カラーフィールドの計算
        this.colorField = this.kernelPoly6(0, this.smoothingRadius);
        this.colorFieldGradient = { x: 0, y: 0 };
        this.colorFieldLaplacian = 0;
        
        for (let i = 0; i < this.neighbors.length; i++) {
            const neighbor = this.neighbors[i];
            const distance = this.neighborDistances[i];
            
            if (distance === 0) continue;
            
            const dx = this.position.x - neighbor.position.x;
            const dy = this.position.y - neighbor.position.y;
            const direction = { x: dx / distance, y: dy / distance };
            
            const colorContribution = neighbor.mass / neighbor.density * 
                this.kernelPoly6(distance, this.smoothingRadius);
            
            this.colorField += colorContribution;
            
            const gradientContribution = neighbor.mass / neighbor.density * 
                this.kernelSpikyGradient(distance, this.smoothingRadius);
            
            this.colorFieldGradient.x += gradientContribution.x * direction.x;
            this.colorFieldGradient.y += gradientContribution.y * direction.y;
            
            this.colorFieldLaplacian += neighbor.mass / neighbor.density * 
                this.kernelViscosityLaplacian(distance, this.smoothingRadius);
        }
        
        // 表面パーティクル検出
        const gradientMagnitude = Math.sqrt(
            this.colorFieldGradient.x * this.colorFieldGradient.x + 
            this.colorFieldGradient.y * this.colorFieldGradient.y
        );
        
        this.isSurfaceParticle = gradientMagnitude > 0.1;
        
        // 表面張力力
        const force = { x: 0, y: 0 };
        if (this.isSurfaceParticle && gradientMagnitude > 0) {
            const normalX = this.colorFieldGradient.x / gradientMagnitude;
            const normalY = this.colorFieldGradient.y / gradientMagnitude;
            
            force.x = -this.surfaceTension * this.colorFieldLaplacian * normalX;
            force.y = -this.surfaceTension * this.colorFieldLaplacian * normalY;
        }
        
        return force;
    }
    
    // 境界条件処理
    handleBoundaryConditions(width, height) {
        const damping = 0.8;
        const margin = 10;
        
        // 左右の境界
        if (this.position.x < margin) {
            this.position.x = margin;
            this.velocity.x = Math.abs(this.velocity.x) * damping;
        } else if (this.position.x > width - margin) {
            this.position.x = width - margin;
            this.velocity.x = -Math.abs(this.velocity.x) * damping;
        }
        
        // 上下の境界
        if (this.position.y < margin) {
            this.position.y = margin;
            this.velocity.y = Math.abs(this.velocity.y) * damping;
        } else if (this.position.y > height - margin) {
            this.position.y = height - margin;
            this.velocity.y = -Math.abs(this.velocity.y) * damping;
        }
    }
    
    // 統合（Verlet integration）
    integrate(deltaTime, width, height) {
        // 外力（重力）
        const gravity = { x: 0, y: 200 };
        
        // 全力の合計
        const totalForce = {
            x: this.acceleration.x + gravity.x,
            y: this.acceleration.y + gravity.y
        };
        
        // Verlet積分
        const newPosX = 2 * this.position.x - this.previousPosition.x + totalForce.x * deltaTime * deltaTime;
        const newPosY = 2 * this.position.y - this.previousPosition.y + totalForce.y * deltaTime * deltaTime;
        
        // 速度更新
        this.velocity.x = (newPosX - this.position.x) / deltaTime;
        this.velocity.y = (newPosY - this.position.y) / deltaTime;
        
        // 位置更新
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
        this.position.x = newPosX;
        this.position.y = newPosY;
        
        // 境界条件
        this.handleBoundaryConditions(width, height);
    }
    
    render(ctx) {
        ctx.save();
        
        // 表面パーティクルは明るく表示
        const brightness = this.isSurfaceParticle ? 1.2 : 1.0;
        const r = Math.min(255, this.color.r * brightness);
        const g = Math.min(255, this.color.g * brightness);
        const b = Math.min(255, this.color.b * brightness);
        
        // 密度に基づくサイズ調整
        const densityRatio = this.density / this.restDensity;
        const renderSize = this.size * Math.max(0.5, Math.min(1.5, densityRatio));
        
        // メインパーティクル
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, renderSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
        ctx.fill();
        
        // 表面パーティクルの追加効果
        if (this.isSurfaceParticle) {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, renderSize * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// 流体力学シミュレーションシステム
class FluidDynamicsSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 500; // 最適化のため500粒子でテスト
        this.spatialGrid = {};
        this.gridSize = 20;
        this.lastTime = performance.now();
        this.timeStep = 0.016; // 60FPS
        this.subSteps = 2; // 安定性のためのサブステップ
        
        this.initializeParticles();
        this.animate();
    }
    
    initializeParticles() {
        // 矩形領域に流体を配置
        const cols = Math.floor(Math.sqrt(this.particleCount));
        const rows = Math.ceil(this.particleCount / cols);
        const spacing = 8;
        const startX = this.canvas.width / 2 - (cols * spacing) / 2;
        const startY = 50;
        
        for (let i = 0; i < this.particleCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * spacing + (Math.random() - 0.5) * 2;
            const y = startY + row * spacing + (Math.random() - 0.5) * 2;
            
            this.particles.push(new FluidParticle(x, y, i));
        }
    }
    
    updateSpatialGrid() {
        this.spatialGrid = {};
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const gridX = Math.floor(particle.position.x / this.gridSize);
            const gridY = Math.floor(particle.position.y / this.gridSize);
            const key = `${gridX},${gridY}`;
            
            if (!this.spatialGrid[key]) {
                this.spatialGrid[key] = [];
            }
            this.spatialGrid[key].push(i);
        }
    }
    
    update(deltaTime) {
        const subDeltaTime = deltaTime / this.subSteps;
        
        for (let step = 0; step < this.subSteps; step++) {
            // 1. 空間グリッド更新
            this.updateSpatialGrid();
            
            // 2. 近傍パーティクル検索
            for (let particle of this.particles) {
                particle.findNeighbors(this.particles, this.spatialGrid);
            }
            
            // 3. 密度計算
            for (let particle of this.particles) {
                particle.calculateDensity();
            }
            
            // 4. 圧力計算
            for (let particle of this.particles) {
                particle.calculatePressure();
            }
            
            // 5. 力の計算
            for (let particle of this.particles) {
                const pressureForce = particle.calculatePressureForce();
                const viscosityForce = particle.calculateViscosityForce();
                const surfaceTensionForce = particle.calculateSurfaceTension();
                
                particle.acceleration.x = pressureForce.x + viscosityForce.x + surfaceTensionForce.x;
                particle.acceleration.y = pressureForce.y + viscosityForce.y + surfaceTensionForce.y;
            }
            
            // 6. 積分
            for (let particle of this.particles) {
                particle.integrate(subDeltaTime, this.canvas.width, this.canvas.height);
            }
        }
    }
    
    render() {
        // 背景をクリア
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パーティクルを描画
        for (let particle of this.particles) {
            particle.render(this.ctx);
        }
        
        // メタボール効果（オプション）
        if (this.particles.length < 200) {
            this.renderMetaballs();
        }
        
        // パフォーマンス情報
        this.renderPerformanceInfo();
    }
    
    renderMetaballs() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let x = 0; x < this.canvas.width; x += 2) {
            for (let y = 0; y < this.canvas.height; y += 2) {
                let sum = 0;
                
                for (let particle of this.particles) {
                    const dx = x - particle.position.x;
                    const dy = y - particle.position.y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq > 0) {
                        sum += particle.size * particle.size / distSq;
                    }
                }
                
                if (sum > 0.8) {
                    const index = (y * this.canvas.width + x) * 4;
                    data[index] = 100; // R
                    data[index + 1] = 150; // G
                    data[index + 2] = 255; // B
                    data[index + 3] = 100; // A
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    renderPerformanceInfo() {
        const fps = Math.round(1000 / (performance.now() - this.lastTime));
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`FPS: ${fps}`, 10, 30);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 50);
        this.ctx.fillText(`Surface Particles: ${this.particles.filter(p => p.isSurfaceParticle).length}`, 10, 70);
    }
    
    animate() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, this.timeStep);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    // インタラクション機能
    addParticles(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = Math.random() * 20;
            const particleX = x + Math.cos(angle) * radius;
            const particleY = y + Math.sin(angle) * radius;
            
            const particle = new FluidParticle(particleX, particleY, this.particles.length);
            particle.velocity.x = (Math.random() - 0.5) * 100;
            particle.velocity.y = (Math.random() - 0.5) * 100;
            
            this.particles.push(particle);
        }
    }
}

// 使用例
/*
const canvas = document.getElementById('fluid-canvas');
const simulation = new FluidDynamicsSimulation(canvas);

// マウスクリックで流体を追加
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    simulation.addParticles(x, y, 20);
});
*/