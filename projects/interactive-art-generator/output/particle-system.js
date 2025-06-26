// Morphing Particle Clusters - 変幻自在パーティクル群システム
class MorphingParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 300;
        this.center = { x: 0, y: 0 };
        this.targetVelocity = 0;
        this.currentMorphState = 'cloud'; // cloud, flower, wave, flame
        
        // フロックアルゴリズムパラメータ
        this.flockParams = {
            separationDistance: 30,
            alignmentDistance: 50,
            cohesionDistance: 80,
            separationForce: 1.5,
            alignmentForce: 1.0,
            cohesionForce: 1.0,
            maxSpeed: 3.0,
            maxForce: 0.1
        };
        
        // 形状パラメータ
        this.shapeParams = {
            cloud: { spread: 60, density: 0.8, flow: 0.2 },
            flower: { spread: 40, density: 1.2, flow: 0.8 },
            wave: { spread: 100, density: 0.6, flow: 1.5 },
            flame: { spread: 20, density: 1.5, flow: 2.0 }
        };
        
        console.log('Morphing Particle System initialized');
    }
    
    addParticles(x, y, velocity, color, sizeMultiplier = 1.0) {
        this.center.x = x;
        this.center.y = y;
        this.targetVelocity = velocity;
        
        // 速度に基づく形状決定
        this.updateMorphState(velocity);
        
        // 新しいパーティクルの生成
        const particleCount = Math.floor(3 + velocity * 0.5);
        const currentShape = this.shapeParams[this.currentMorphState];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = Math.random() * currentShape.spread;
            
            const particle = {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                ax: 0,
                ay: 0,
                size: (2 + Math.random() * 4) * sizeMultiplier,
                initialSize: (2 + Math.random() * 4) * sizeMultiplier,
                life: 1.0,
                maxLife: 120 + Math.random() * 180,
                color: this.parseColor(color),
                brightness: 0.8 + Math.random() * 0.2,
                morphInfluence: Math.random(), // 形状変化への影響力
                id: Date.now() + Math.random() // 一意ID
            };
            
            this.particles.push(particle);
        }
        
        // パーティクル数制限
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }
    
    updateMorphState(velocity) {
        if (velocity < 5) {
            this.currentMorphState = 'cloud';
        } else if (velocity < 15) {
            this.currentMorphState = 'flower';
        } else if (velocity < 30) {
            this.currentMorphState = 'wave';
        } else {
            this.currentMorphState = 'flame';
        }
    }
    
    parseColor(colorString) {
        const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            return {
                h: parseInt(match[1]),
                s: parseInt(match[2]),
                l: parseInt(match[3])
            };
        }
        return { h: 180, s: 70, l: 60 };
    }
    
    update(timestamp) {
        this.updateParticlePhysics();
        this.applyFlockBehavior();
        this.updateParticleLife();
    }
    
    updateParticlePhysics() {
        const currentShape = this.shapeParams[this.currentMorphState];
        
        this.particles.forEach(particle => {
            // 形状に基づく引力
            const dx = this.center.x - particle.x;
            const dy = this.center.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const force = currentShape.density * 0.01;
                particle.ax += (dx / distance) * force;
                particle.ay += (dy / distance) * force;
            }
            
            // 形状特有の動き
            this.applyShapeSpecificForces(particle, currentShape);
            
            // 物理更新
            particle.vx += particle.ax;
            particle.vy += particle.ay;
            particle.vx *= 0.98; // 摩擦
            particle.vy *= 0.98;
            
            // 速度制限
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > this.flockParams.maxSpeed) {
                particle.vx = (particle.vx / speed) * this.flockParams.maxSpeed;
                particle.vy = (particle.vy / speed) * this.flockParams.maxSpeed;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 加速度リセット
            particle.ax = 0;
            particle.ay = 0;
        });
    }
    
    applyShapeSpecificForces(particle, shapeParams) {
        const time = Date.now() * 0.001;
        const flow = shapeParams.flow;
        
        switch (this.currentMorphState) {
            case 'cloud':
                // 緩やかな浮遊運動
                particle.ax += Math.sin(time + particle.id * 0.01) * 0.005;
                particle.ay += Math.cos(time + particle.id * 0.01) * 0.005;
                break;
                
            case 'flower':
                // 花びらのような回転運動
                const angle = Math.atan2(particle.y - this.center.y, particle.x - this.center.x);
                particle.ax += Math.cos(angle + Math.PI / 2) * flow * 0.01;
                particle.ay += Math.sin(angle + Math.PI / 2) * flow * 0.01;
                break;
                
            case 'wave':
                // 波のような横方向の動き
                particle.ax += Math.sin(time * 2 + particle.y * 0.01) * flow * 0.02;
                particle.ay += Math.cos(time + particle.x * 0.01) * flow * 0.01;
                break;
                
            case 'flame':
                // 炎のような上向きの動き
                particle.ax += (Math.random() - 0.5) * flow * 0.05;
                particle.ay -= flow * 0.02;
                break;
        }
    }
    
    applyFlockBehavior() {
        this.particles.forEach((particle, index) => {
            const neighbors = this.getNeighbors(particle, index);
            
            if (neighbors.length > 0) {
                const separation = this.calculateSeparation(particle, neighbors);
                const alignment = this.calculateAlignment(particle, neighbors);
                const cohesion = this.calculateCohesion(particle, neighbors);
                
                // フォース適用
                particle.ax += separation.x * this.flockParams.separationForce;
                particle.ay += separation.y * this.flockParams.separationForce;
                particle.ax += alignment.x * this.flockParams.alignmentForce;
                particle.ay += alignment.y * this.flockParams.alignmentForce;
                particle.ax += cohesion.x * this.flockParams.cohesionForce;
                particle.ay += cohesion.y * this.flockParams.cohesionForce;
            }
        });
    }
    
    getNeighbors(particle, index) {
        const neighbors = [];
        const maxDistance = this.flockParams.cohesionDistance;
        
        for (let i = 0; i < this.particles.length; i++) {
            if (i === index) continue;
            
            const other = this.particles[i];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                neighbors.push({ particle: other, distance: distance });
            }
        }
        
        return neighbors;
    }
    
    calculateSeparation(particle, neighbors) {
        let steer = { x: 0, y: 0 };
        let count = 0;
        
        neighbors.forEach(neighbor => {
            if (neighbor.distance < this.flockParams.separationDistance) {
                const dx = particle.x - neighbor.particle.x;
                const dy = particle.y - neighbor.particle.y;
                const distance = neighbor.distance;
                
                if (distance > 0) {
                    steer.x += dx / distance;
                    steer.y += dy / distance;
                    count++;
                }
            }
        });
        
        if (count > 0) {
            steer.x /= count;
            steer.y /= count;
        }
        
        return this.limitForce(steer);
    }
    
    calculateAlignment(particle, neighbors) {
        let steer = { x: 0, y: 0 };
        let count = 0;
        
        neighbors.forEach(neighbor => {
            if (neighbor.distance < this.flockParams.alignmentDistance) {
                steer.x += neighbor.particle.vx;
                steer.y += neighbor.particle.vy;
                count++;
            }
        });
        
        if (count > 0) {
            steer.x /= count;
            steer.y /= count;
            steer.x -= particle.vx;
            steer.y -= particle.vy;
        }
        
        return this.limitForce(steer);
    }
    
    calculateCohesion(particle, neighbors) {
        let center = { x: 0, y: 0 };
        let count = 0;
        
        neighbors.forEach(neighbor => {
            center.x += neighbor.particle.x;
            center.y += neighbor.particle.y;
            count++;
        });
        
        if (count > 0) {
            center.x /= count;
            center.y /= count;
            
            const steer = {
                x: center.x - particle.x,
                y: center.y - particle.y
            };
            
            return this.limitForce(steer);
        }
        
        return { x: 0, y: 0 };
    }
    
    limitForce(force) {
        const magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
        if (magnitude > this.flockParams.maxForce) {
            force.x = (force.x / magnitude) * this.flockParams.maxForce;
            force.y = (force.y / magnitude) * this.flockParams.maxForce;
        }
        return force;
    }
    
    updateParticleLife() {
        this.particles = this.particles.filter(particle => {
            particle.maxLife--;
            particle.life = Math.max(0, particle.maxLife / 300);
            particle.size = particle.initialSize * (0.5 + particle.life * 0.5);
            particle.brightness = (0.6 + Math.random() * 0.4) * particle.life;
            
            return particle.maxLife > 0;
        });
    }
    
    render() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        // 形状に応じた描画スタイル
        this.renderParticlesWithMorphing();
        
        this.ctx.restore();
    }
    
    renderParticlesWithMorphing() {
        const currentShape = this.shapeParams[this.currentMorphState];
        
        this.particles.forEach(particle => {
            if (particle.life <= 0) return;
            
            const alpha = particle.brightness * particle.life;
            const color = `hsla(${particle.color.h}, ${particle.color.s}%, ${particle.color.l}%, ${alpha})`;
            
            // 形状に応じた描画
            switch (this.currentMorphState) {
                case 'cloud':
                    this.renderParticleAsCloud(particle, color);
                    break;
                case 'flower':
                    this.renderParticleAsFlower(particle, color);
                    break;
                case 'wave':
                    this.renderParticleAsWave(particle, color);
                    break;
                case 'flame':
                    this.renderParticleAsFlame(particle, color);
                    break;
            }
        });
    }
    
    renderParticleAsCloud(particle, color) {
        const size = particle.size * 1.5;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderParticleAsFlower(particle, color) {
        const size = particle.size;
        this.ctx.fillStyle = color;
        
        // 花びらのような形状
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const x = particle.x + Math.cos(angle) * size;
            const y = particle.y + Math.sin(angle) * size;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderParticleAsWave(particle, color) {
        const size = particle.size;
        this.ctx.fillStyle = color;
        
        // 楕円形状
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.scale(2, 0.8);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderParticleAsFlame(particle, color) {
        const size = particle.size;
        this.ctx.fillStyle = color;
        
        // 炎のような縦長の形状
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.scale(0.6, 1.4);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    clear() {
        this.particles = [];
    }
    
    getStats() {
        return {
            particles: this.particles.length,
            morphState: this.currentMorphState,
            velocity: this.targetVelocity
        };
    }
}