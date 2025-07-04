let canvas = null;
let ctx = null;
let isInitialized = false;

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  switch (type) {
    case 'init':
      initializeCanvas(event.data);
      break;
    case 'render':
      renderFrame(event.data);
      break;
    case 'resize':
      resizeCanvas(event.data);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};

function initializeCanvas(data) {
  try {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    
    if (data.width && data.height) {
      canvas.width = data.width;
      canvas.height = data.height;
    }
    
    isInitialized = true;
    
    self.postMessage({
      type: 'initialized',
      data: { success: true }
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: error.message, stack: error.stack }
    });
  }
}

function renderFrame(data) {
  if (!isInitialized || !ctx) {
    self.postMessage({
      type: 'error',
      data: { message: 'Canvas not initialized' }
    });
    return;
  }
  
  const startTime = performance.now();
  
  try {
    const { particles, viewport, quality, timestamp } = data;
    
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    
    ctx.save();
    
    const particleStep = getParticleStep(quality);
    const useGradients = quality === 'high';
    
    for (let i = 0; i < particles.length; i += particleStep) {
      const particle = particles[i];
      
      if (particle.alpha <= 0.01) continue;
      
      renderParticle(particle, useGradients);
    }
    
    ctx.restore();
    
    const renderTime = performance.now() - startTime;
    
    try {
      const imageData = ctx.getImageData(0, 0, viewport.width, viewport.height);
      
      self.postMessage({
        type: 'renderComplete',
        data: {
          imageData: imageData,
          renderTime: renderTime,
          particleCount: particles.length,
          timestamp: timestamp
        }
      });
    } catch (transferError) {
      self.postMessage({
        type: 'renderComplete',
        data: {
          renderTime: renderTime,
          particleCount: particles.length,
          timestamp: timestamp
        }
      });
    }
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: error.message, stack: error.stack }
    });
  }
}

function renderParticle(particle, useGradients) {
  ctx.globalAlpha = particle.alpha;
  
  if (useGradients) {
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = particle.color;
  }
  
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
}

function getParticleStep(quality) {
  switch (quality) {
    case 'low':
      return 3;
    case 'medium':
      return 2;
    case 'high':
    default:
      return 1;
  }
}

function resizeCanvas(data) {
  if (!canvas) return;
  
  try {
    canvas.width = data.width;
    canvas.height = data.height;
    
    self.postMessage({
      type: 'resized',
      data: { width: data.width, height: data.height }
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: error.message, stack: error.stack }
    });
  }
}

self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    data: { message: error.message, filename: error.filename, lineno: error.lineno }
  });
};