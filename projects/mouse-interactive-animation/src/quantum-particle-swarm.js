/**
 * Quantum Particle Swarm Visualizer
 * 量子力学的パーティクルシステムで、マウス位置を引力源とした美しい群衆動作
 */

class QuantumParticleSwarm {
  constructor(canvas, particleCount = 200) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = particleCount;
    this.mousePos = { x: 0, y: 0 };
    this.quantumStates = [];
    
    // Boids アルゴリズムパラメータ
    this.separationRadius = 25;
    this.alignmentRadius = 50;
    this.cohesionRadius = 50;
    this.maxSpeed = 2;
    this.maxForce = 0.05;
    
    // 量子パラメータ
    this.entanglementStrength = 0.1;
    this.waveFunction = 0;
    this.uncertainty = 10;
    
    this.initialize();
  }

  initialize() {
    // パーティクル生成
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new QuantumParticle(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        i
      ));
    }

    // 量子もつれペア作成
    this.createEntanglements();
  }

  createEntanglements() {
    this.quantumStates = [];
    
    // ランダムにパーティクルペアを作成
    for (let i = 0; i < this.particles.length; i += 2) {
      if (i + 1 < this.particles.length) {
        this.quantumStates.push({
          particle1: i,
          particle2: i + 1,
          entanglement: Math.random() * this.entanglementStrength,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  updateMousePosition(x, y) {
    this.mousePos = { x, y };
  }

  update() {
    this.waveFunction += 0.02;
    
    // 各パーティクルに対してBoidsアルゴリズム適用
    this.particles.forEach((particle, index) => {
      // Boids の3つの基本原則
      const separation = this.separate(particle, index);
      const alignment = this.align(particle, index);
      const cohesion = this.cohere(particle, index);
      const mouseAttraction = this.attractToMouse(particle);
      const quantumForce = this.applyQuantumEffect(particle, index);

      // 力の合計
      particle.acceleration.x = separation.x + alignment.x + cohesion.x + 
                               mouseAttraction.x + quantumForce.x;
      particle.acceleration.y = separation.y + alignment.y + cohesion.y + 
                               mouseAttraction.y + quantumForce.y;

      particle.update();
      
      // 境界での反射
      this.handleBoundaries(particle);
    });

    // 量子もつれ効果の更新
    this.updateQuantumEntanglement();
  }

  // 分離力（近くのパーティクルから離れる）
  separate(particle, index) {
    const force = { x: 0, y: 0 };
    let count = 0;

    this.particles.forEach((other, otherIndex) => {
      if (index !== otherIndex) {
        const distance = this.getDistance(particle, other);
        if (distance < this.separationRadius && distance > 0) {
          const diff = {
            x: particle.position.x - other.position.x,
            y: particle.position.y - other.position.y
          };
          // 距離に反比例して力を適用
          const magnitude = 1 / distance;
          force.x += diff.x * magnitude;
          force.y += diff.y * magnitude;
          count++;
        }
      }
    });

    if (count > 0) {
      force.x /= count;
      force.y /= count;
      
      // 正規化してmax forceに制限
      const magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
      if (magnitude > 0) {
        force.x = (force.x / magnitude) * this.maxForce;
        force.y = (force.y / magnitude) * this.maxForce;
      }
    }

    return force;
  }

  // 整列力（近くのパーティクルと同じ方向に向かう）
  align(particle, index) {
    const force = { x: 0, y: 0 };
    let count = 0;

    this.particles.forEach((other, otherIndex) => {
      if (index !== otherIndex) {
        const distance = this.getDistance(particle, other);
        if (distance < this.alignmentRadius) {
          force.x += other.velocity.x;
          force.y += other.velocity.y;
          count++;
        }
      }
    });

    if (count > 0) {
      force.x /= count;
      force.y /= count;
      
      // 速度に制限
      const magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
      if (magnitude > this.maxSpeed) {
        force.x = (force.x / magnitude) * this.maxSpeed;
        force.y = (force.y / magnitude) * this.maxSpeed;
      }
      
      // 力に変換
      force.x = (force.x - particle.velocity.x) * 0.1;
      force.y = (force.y - particle.velocity.y) * 0.1;
    }

    return force;
  }

  // 結束力（近くのパーティクルの中心に向かう）
  cohere(particle, index) {
    const center = { x: 0, y: 0 };
    let count = 0;

    this.particles.forEach((other, otherIndex) => {
      if (index !== otherIndex) {
        const distance = this.getDistance(particle, other);
        if (distance < this.cohesionRadius) {
          center.x += other.position.x;
          center.y += other.position.y;
          count++;
        }
      }
    });

    if (count > 0) {
      center.x /= count;
      center.y /= count;
      
      return this.seek(particle, center);
    }

    return { x: 0, y: 0 };
  }

  // マウスへの引力
  attractToMouse(particle) {
    const distance = this.getDistance(particle, this.mousePos);
    const attraction = Math.max(0, 1 - distance / 200); // 200px以内で影響
    
    return this.seek(particle, this.mousePos, attraction * 0.3);
  }

  // 量子効果の適用
  applyQuantumEffect(particle, index) {
    const force = { x: 0, y: 0 };
    
    // 不確定性原理による揺らぎ
    const uncertainty = {
      x: (Math.random() - 0.5) * this.uncertainty * 0.01,
      y: (Math.random() - 0.5) * this.uncertainty * 0.01
    };
    
    // 波動関数による位置の揺らぎ
    const wave = {
      x: Math.sin(this.waveFunction + index * 0.1) * 0.5,
      y: Math.cos(this.waveFunction + index * 0.1) * 0.5
    };

    force.x = uncertainty.x + wave.x;
    force.y = uncertainty.y + wave.y;

    return force;
  }

  // 量子もつれ効果の更新
  updateQuantumEntanglement() {
    this.quantumStates.forEach(state => {
      const p1 = this.particles[state.particle1];
      const p2 = this.particles[state.particle2];
      
      // もつれによる相関運動
      const correlation = Math.sin(this.waveFunction + state.phase) * state.entanglement;
      
      p1.position.x += correlation;
      p2.position.x -= correlation; // 反対方向の相関
      p1.position.y += correlation * 0.5;
      p2.position.y -= correlation * 0.5;
    });
  }

  // 目標に向かう力
  seek(particle, target, multiplier = 1) {
    const desired = {
      x: target.x - particle.position.x,
      y: target.y - particle.position.y
    };
    
    const magnitude = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
    if (magnitude > 0) {
      desired.x = (desired.x / magnitude) * this.maxSpeed;
      desired.y = (desired.y / magnitude) * this.maxSpeed;
    }
    
    const force = {
      x: (desired.x - particle.velocity.x) * multiplier,
      y: (desired.y - particle.velocity.y) * multiplier
    };
    
    // 力の制限
    const forceMag = Math.sqrt(force.x * force.x + force.y * force.y);
    if (forceMag > this.maxForce) {
      force.x = (force.x / forceMag) * this.maxForce;
      force.y = (force.y / forceMag) * this.maxForce;
    }
    
    return force;
  }

  // 距離計算
  getDistance(a, b) {
    return Math.sqrt((a.position.x - b.x) ** 2 + (a.position.y - b.y) ** 2);
  }

  // 境界処理
  handleBoundaries(particle) {
    const margin = 20;
    
    if (particle.position.x < margin) {
      particle.velocity.x = Math.abs(particle.velocity.x);
    } else if (particle.position.x > this.canvas.width - margin) {
      particle.velocity.x = -Math.abs(particle.velocity.x);
    }
    
    if (particle.position.y < margin) {
      particle.velocity.y = Math.abs(particle.velocity.y);
    } else if (particle.position.y > this.canvas.height - margin) {
      particle.velocity.y = -Math.abs(particle.velocity.y);
    }
  }

  // 描画
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 量子もつれの可視化
    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
    this.ctx.lineWidth = 1;
    this.quantumStates.forEach(state => {
      const p1 = this.particles[state.particle1];
      const p2 = this.particles[state.particle2];
      
      this.ctx.beginPath();
      this.ctx.moveTo(p1.position.x, p1.position.y);
      this.ctx.lineTo(p2.position.x, p2.position.y);
      this.ctx.stroke();
    });
    
    // パーティクル描画
    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });
  }
}

// 量子パーティクルクラス
class QuantumParticle {
  constructor(x, y, id) {
    this.position = { x, y };
    this.velocity = { 
      x: (Math.random() - 0.5) * 2, 
      y: (Math.random() - 0.5) * 2 
    };
    this.acceleration = { x: 0, y: 0 };
    this.id = id;
    this.size = Math.random() * 3 + 2;
    this.hue = (id * 137.5) % 360; // 黄金角による色分散
  }

  update() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    
    // 最大速度制限
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (speed > 3) {
      this.velocity.x = (this.velocity.x / speed) * 3;
      this.velocity.y = (this.velocity.y / speed) * 3;
    }
    
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // 加速度リセット
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  render(ctx) {
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    const alpha = Math.min(1, speed / 2 + 0.3);
    
    ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // 軌跡エフェクト
    ctx.strokeStyle = `hsla(${this.hue}, 70%, 60%, ${alpha * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(
      this.position.x - this.velocity.x * 3,
      this.position.y - this.velocity.y * 3
    );
    ctx.stroke();
  }
}

export default QuantumParticleSwarm;