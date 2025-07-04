class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 1.0;
    this.alpha = 1.0;
    this.size = 1.0;
    this.color = '#ffffff';
    this.active = false;
    this.state = 'inactive';
    this.startTime = 0;
    this.targetX = 0;
    this.targetY = 0;
  }

  update(deltaTime) {
    if (!this.active) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    this.life = Math.max(0, 1.0 - elapsed / 2.0);
    this.alpha = this.life;

    if (this.state === 'exploding') {
      this.vx *= 0.98;
      this.vy *= 0.98;
    } else if (this.state === 'forming') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      this.vx = dx * 0.1;
      this.vy = dy * 0.1;
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    if (this.life <= 0) {
      this.active = false;
      return false;
    }
    return true;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  setState(state) {
    this.state = state;
    this.active = true;
    this.startTime = performance.now();
  }
}

export class QuantumParticlePool {
  constructor(maxParticles = 10000) {
    this.maxParticles = maxParticles;
    this.pools = {
      active: [],
      inactive: [],
      exploding: [],
      forming: []
    };
    this.totalParticles = 0;
    this.memoryUsage = 0;
    this.preAllocate(maxParticles);
  }

  preAllocate(count) {
    console.log(`Pre-allocating ${count} particles...`);
    for (let i = 0; i < count; i++) {
      const particle = new Particle();
      this.pools.inactive.push(particle);
      this.totalParticles++;
    }
    this.updateMemoryUsage();
  }

  acquire(state = 'active') {
    let particle = this.pools.inactive.pop();
    
    if (!particle) {
      if (this.totalParticles >= this.maxParticles) {
        particle = this.recycleOldestParticle();
      } else {
        particle = new Particle();
        this.totalParticles++;
      }
    }

    if (particle) {
      particle.reset();
      particle.setState(state);
      this.pools[state].push(particle);
      this.updateMemoryUsage();
    }
    
    return particle;
  }

  release(particle) {
    if (!particle) return;

    this.removeFromAllPools(particle);
    particle.reset();
    this.pools.inactive.push(particle);
    this.updateMemoryUsage();
  }

  removeFromAllPools(particle) {
    Object.keys(this.pools).forEach(poolName => {
      const pool = this.pools[poolName];
      const index = pool.indexOf(particle);
      if (index !== -1) {
        pool.splice(index, 1);
      }
    });
  }

  recycleOldestParticle() {
    const activePools = ['active', 'exploding', 'forming'];
    let oldestParticle = null;
    let oldestTime = Infinity;

    activePools.forEach(poolName => {
      this.pools[poolName].forEach(particle => {
        if (particle.startTime < oldestTime) {
          oldestTime = particle.startTime;
          oldestParticle = particle;
        }
      });
    });

    if (oldestParticle) {
      this.removeFromAllPools(oldestParticle);
      return oldestParticle;
    }

    return new Particle();
  }

  update(deltaTime) {
    const particlesToRelease = [];

    Object.keys(this.pools).forEach(poolName => {
      if (poolName === 'inactive') return;

      const pool = this.pools[poolName];
      for (let i = pool.length - 1; i >= 0; i--) {
        const particle = pool[i];
        if (!particle.update(deltaTime)) {
          particlesToRelease.push(particle);
        }
      }
    });

    particlesToRelease.forEach(particle => {
      this.release(particle);
    });

    this.updateMemoryUsage();
  }

  updateMemoryUsage() {
    this.memoryUsage = this.totalParticles * 100;
  }

  getActiveParticles() {
    const allActive = [];
    Object.keys(this.pools).forEach(poolName => {
      if (poolName !== 'inactive') {
        allActive.push(...this.pools[poolName]);
      }
    });
    return allActive;
  }

  getParticlesByState(state) {
    return this.pools[state] || [];
  }

  getStats() {
    return {
      totalParticles: this.totalParticles,
      activeParticles: this.getActiveParticles().length,
      poolStats: Object.keys(this.pools).reduce((stats, poolName) => {
        stats[poolName] = this.pools[poolName].length;
        return stats;
      }, {}),
      memoryUsage: this.memoryUsage
    };
  }

  clear() {
    Object.keys(this.pools).forEach(poolName => {
      this.pools[poolName].forEach(particle => {
        particle.reset();
      });
      
      if (poolName !== 'inactive') {
        this.pools.inactive.push(...this.pools[poolName]);
        this.pools[poolName] = [];
      }
    });
    this.updateMemoryUsage();
  }

  explodeText(text, x, y, canvasWidth, canvasHeight) {
    const particles = [];
    const charWidth = 20;
    const charHeight = 30;
    const startX = x - (text.length * charWidth) / 2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') continue;

      const charX = startX + i * charWidth;
      const particleCount = Math.min(50, Math.floor(800 / text.length));

      for (let j = 0; j < particleCount; j++) {
        const particle = this.acquire('exploding');
        if (particle) {
          particle.setPosition(
            charX + Math.random() * charWidth,
            y + Math.random() * charHeight
          );
          
          particle.setVelocity(
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400
          );
          
          particle.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
          particle.size = Math.random() * 3 + 1;
          particles.push(particle);
        }
      }
    }

    return particles;
  }

  formText(text, x, y, canvasWidth, canvasHeight) {
    const particles = [];
    const charWidth = 20;
    const charHeight = 30;
    const startX = x - (text.length * charWidth) / 2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') continue;

      const charX = startX + i * charWidth;
      const particleCount = Math.min(50, Math.floor(800 / text.length));

      for (let j = 0; j < particleCount; j++) {
        const particle = this.acquire('forming');
        if (particle) {
          particle.setPosition(
            Math.random() * canvasWidth,
            Math.random() * canvasHeight
          );
          
          particle.setTarget(
            charX + Math.random() * charWidth,
            y + Math.random() * charHeight
          );
          
          particle.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
          particle.size = Math.random() * 3 + 1;
          particles.push(particle);
        }
      }
    }

    return particles;
  }
}

export default QuantumParticlePool;