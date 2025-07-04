let particles = [];
let isRunning = false;
let lastUpdateTime = 0;

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  switch (type) {
    case 'init':
      initializePhysics(data);
      break;
    case 'updateParticles':
      updateParticles(data);
      break;
    case 'addParticles':
      addParticles(data);
      break;
    case 'start':
      startPhysics();
      break;
    case 'stop':
      stopPhysics();
      break;
    case 'clear':
      clearParticles();
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};

function initializePhysics(data) {
  particles = [];
  isRunning = false;
  lastUpdateTime = performance.now();
  
  self.postMessage({
    type: 'initialized',
    data: { success: true }
  });
}

function addParticles(data) {
  try {
    const newParticles = data.particles || [];
    particles.push(...newParticles);
    
    self.postMessage({
      type: 'particlesAdded',
      data: { count: newParticles.length, total: particles.length }
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: error.message }
    });
  }
}

function updateParticles(data) {
  if (!isRunning) return;
  
  try {
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastUpdateTime) / 1000, 1/30);
    lastUpdateTime = currentTime;
    
    const { canvasWidth, canvasHeight, gravity = 0, friction = 0.99 } = data;
    
    const activeParticles = [];
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      if (!particle.active) {
        particles.splice(i, 1);
        continue;
      }
      
      updateParticlePhysics(particle, deltaTime, gravity, friction, canvasWidth, canvasHeight);
      
      if (particle.life > 0) {
        activeParticles.push(particle);
      } else {
        particles.splice(i, 1);
      }
    }
    
    self.postMessage({
      type: 'physicsUpdate',
      data: {
        particles: activeParticles,
        count: activeParticles.length,
        deltaTime: deltaTime
      }
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: error.message }
    });
  }
}

function updateParticlePhysics(particle, deltaTime, gravity, friction, canvasWidth, canvasHeight) {
  const elapsed = (performance.now() - particle.startTime) / 1000;
  particle.life = Math.max(0, 1.0 - elapsed / 2.0);
  particle.alpha = particle.life;
  
  if (particle.state === 'exploding') {
    particle.vy += gravity * deltaTime;
    particle.vx *= friction;
    particle.vy *= friction;
    
    if (particle.x < 0 || particle.x > canvasWidth) {
      particle.vx *= -0.8;
    }
    if (particle.y < 0 || particle.y > canvasHeight) {
      particle.vy *= -0.8;
    }
    
  } else if (particle.state === 'forming') {
    const dx = particle.targetX - particle.x;
    const dy = particle.targetY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      const force = Math.min(distance * 0.1, 5);
      particle.vx = (dx / distance) * force;
      particle.vy = (dy / distance) * force;
    } else {
      particle.vx *= 0.9;
      particle.vy *= 0.9;
    }
  }
  
  particle.x += particle.vx * deltaTime;
  particle.y += particle.vy * deltaTime;
  
  particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
  particle.y = Math.max(0, Math.min(canvasHeight, particle.y));
  
  if (particle.life <= 0) {
    particle.active = false;
  }
}

function startPhysics() {
  isRunning = true;
  lastUpdateTime = performance.now();
  physicsLoop();
}

function stopPhysics() {
  isRunning = false;
}

function clearParticles() {
  particles = [];
  
  self.postMessage({
    type: 'particlesCleared',
    data: { success: true }
  });
}

function physicsLoop() {
  if (!isRunning) return;
  
  updateParticles({
    canvasWidth: 800,
    canvasHeight: 600,
    gravity: 100,
    friction: 0.99
  });
  
  setTimeout(() => {
    if (isRunning) {
      physicsLoop();
    }
  }, 16);
}

self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    data: { message: error.message, filename: error.filename, lineno: error.lineno }
  });
};