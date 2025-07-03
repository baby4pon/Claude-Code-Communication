/**
 * Visual Effects System - 革新的な視覚エフェクトの統合システム
 * Worker3 による UI/UX・視覚エフェクト専門実装
 */

// 感情マッピングシステム
class EmotionMapper {
  constructor() {
    this.history = [];
    this.currentEmotion = 'neutral';
    this.emotionIntensity = 0;
  }

  analyzeMovement(mouseData) {
    const { velocity, acceleration, direction } = mouseData;
    
    // 動作パターンの分析
    const smoothness = this.calculateSmoothness(velocity);
    const energy = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    const directionChange = this.calculateDirectionChange(direction);

    // 感情の推定
    if (energy < 50 && smoothness > 0.8) {
      this.currentEmotion = 'calm';
    } else if (energy > 200 && directionChange > 0.5) {
      this.currentEmotion = 'excited';
    } else if (smoothness > 0.9 && energy < 100) {
      this.currentEmotion = 'contemplative';
    } else if (directionChange > 0.7) {
      this.currentEmotion = 'playful';
    } else {
      this.currentEmotion = 'focused';
    }

    this.emotionIntensity = Math.min(energy / 100, 2.0);
    return this.currentEmotion;
  }

  calculateSmoothness(velocity) {
    if (this.history.length < 5) return 0.5;
    
    const recent = this.history.slice(-5);
    const variance = recent.reduce((sum, v, i) => {
      if (i === 0) return 0;
      const diff = Math.abs(v.speed - recent[i-1].speed);
      return sum + diff;
    }, 0) / recent.length;
    
    return Math.max(0, 1 - variance / 100);
  }

  calculateDirectionChange(direction) {
    if (this.history.length < 3) return 0;
    
    const recent = this.history.slice(-3);
    let changes = 0;
    for (let i = 1; i < recent.length; i++) {
      const angleDiff = Math.abs(recent[i].angle - recent[i-1].angle);
      if (angleDiff > Math.PI / 4) changes++;
    }
    return changes / (recent.length - 1);
  }
}

// Synaptic Flow エフェクトシステム
class SynapticFlowEffect {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.neurons = [];
    this.connections = [];
    this.pulses = [];
    this.maxNeurons = 50;
  }

  createNeuron(x, y, energy) {
    const neuron = {
      x, y,
      energy: energy * 0.1,
      radius: 3 + energy * 0.05,
      connections: [],
      lastPulse: 0,
      hue: (energy * 2) % 360
    };
    
    this.neurons.push(neuron);
    if (this.neurons.length > this.maxNeurons) {
      this.neurons.shift();
    }
    
    this.createConnections(neuron);
    return neuron;
  }

  createConnections(newNeuron) {
    const maxDistance = 150;
    
    this.neurons.forEach(neuron => {
      if (neuron === newNeuron) return;
      
      const distance = Math.hypot(
        newNeuron.x - neuron.x,
        newNeuron.y - neuron.y
      );
      
      if (distance < maxDistance) {
        const connection = {
          from: neuron,
          to: newNeuron,
          strength: 1 - (distance / maxDistance),
          lastPulse: 0
        };
        
        this.connections.push(connection);
        newNeuron.connections.push(connection);
        neuron.connections.push(connection);
      }
    });
  }

  triggerPulse(x, y, intensity) {
    const nearestNeuron = this.findNearestNeuron(x, y);
    if (nearestNeuron && Date.now() - nearestNeuron.lastPulse > 100) {
      this.createPulse(nearestNeuron, intensity);
      nearestNeuron.lastPulse = Date.now();
    }
  }

  createPulse(neuron, intensity) {
    const pulse = {
      origin: neuron,
      intensity,
      progress: 0,
      connections: [...neuron.connections],
      hue: neuron.hue
    };
    
    this.pulses.push(pulse);
  }

  findNearestNeuron(x, y) {
    let nearest = null;
    let minDistance = Infinity;
    
    this.neurons.forEach(neuron => {
      const distance = Math.hypot(x - neuron.x, y - neuron.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = neuron;
      }
    });
    
    return minDistance < 100 ? nearest : null;
  }

  update() {
    // パルスの更新
    this.pulses = this.pulses.filter(pulse => {
      pulse.progress += 0.02;
      
      if (pulse.progress >= 1) {
        // 次のニューロンにパルスを伝播
        pulse.connections.forEach(connection => {
          const nextNeuron = connection.from === pulse.origin ? connection.to : connection.from;
          if (Math.random() < connection.strength * pulse.intensity) {
            this.createPulse(nextNeuron, pulse.intensity * 0.8);
          }
        });
        return false;
      }
      return true;
    });

    // ニューロンの自然減衰
    this.neurons.forEach(neuron => {
      neuron.energy *= 0.995;
      neuron.radius = Math.max(2, neuron.radius * 0.999);
    });

    // 古いコネクションの削除
    this.connections = this.connections.filter(conn => 
      this.neurons.includes(conn.from) && this.neurons.includes(conn.to)
    );
  }

  render() {
    this.ctx.save();
    
    // コネクションの描画
    this.connections.forEach(connection => {
      const alpha = connection.strength * 0.3;
      this.ctx.strokeStyle = `hsla(${connection.from.hue}, 70%, 60%, ${alpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(connection.from.x, connection.from.y);
      this.ctx.lineTo(connection.to.x, connection.to.y);
      this.ctx.stroke();
    });

    // ニューロンの描画
    this.neurons.forEach(neuron => {
      const gradient = this.ctx.createRadialGradient(
        neuron.x, neuron.y, 0,
        neuron.x, neuron.y, neuron.radius * 2
      );
      gradient.addColorStop(0, `hsla(${neuron.hue}, 80%, 70%, 0.8)`);
      gradient.addColorStop(1, `hsla(${neuron.hue}, 80%, 50%, 0.2)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // パルスの描画
    this.pulses.forEach(pulse => {
      pulse.connections.forEach(connection => {
        const startX = connection.from.x;
        const startY = connection.from.y;
        const endX = connection.to.x;
        const endY = connection.to.y;
        
        const currentX = startX + (endX - startX) * pulse.progress;
        const currentY = startY + (endY - startY) * pulse.progress;
        
        const gradient = this.ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, 8
        );
        gradient.addColorStop(0, `hsla(${pulse.hue}, 90%, 80%, ${pulse.intensity})`);
        gradient.addColorStop(1, `hsla(${pulse.hue}, 90%, 60%, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 6 * pulse.intensity, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });
    
    this.ctx.restore();
  }
}

// Quantum Ripple システム
class QuantumRippleEffect {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ripples = [];
    this.maxRipples = 20;
  }

  createRipple(x, y, intensity) {
    const ripple = {
      x, y,
      radius: 0,
      maxRadius: 100 + intensity * 50,
      intensity,
      frequency: 0.02 + intensity * 0.01,
      phase: 0,
      hue: (intensity * 60 + Date.now() * 0.1) % 360,
      life: 1.0
    };
    
    this.ripples.push(ripple);
    if (this.ripples.length > this.maxRipples) {
      this.ripples.shift();
    }
  }

  update() {
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += 2;
      ripple.phase += ripple.frequency;
      ripple.life -= 0.008;
      
      return ripple.life > 0 && ripple.radius < ripple.maxRadius;
    });
  }

  render() {
    this.ctx.save();
    
    this.ripples.forEach(ripple => {
      const wave = Math.sin(ripple.phase) * 0.5 + 0.5;
      const alpha = ripple.life * wave * 0.6;
      
      // 干渉パターンの計算
      const interferencePattern = this.calculateInterference(ripple);
      
      this.ctx.strokeStyle = `hsla(${ripple.hue}, 70%, 60%, ${alpha})`;
      this.ctx.lineWidth = 2 + ripple.intensity * 0.5;
      
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius + interferencePattern * 5, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // 内側のグロー効果
      if (wave > 0.7) {
        this.ctx.shadowColor = `hsl(${ripple.hue}, 80%, 70%)`;
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
    });
    
    this.ctx.restore();
  }

  calculateInterference(currentRipple) {
    let interference = 0;
    
    this.ripples.forEach(otherRipple => {
      if (otherRipple === currentRipple) return;
      
      const distance = Math.hypot(
        currentRipple.x - otherRipple.x,
        currentRipple.y - otherRipple.y
      );
      
      if (distance < 200) {
        const phaseDiff = currentRipple.phase - otherRipple.phase;
        const amplitudeFactor = 1 - (distance / 200);
        interference += Math.sin(phaseDiff) * amplitudeFactor * 0.3;
      }
    });
    
    return interference;
  }
}

// メインの視覚エフェクトマネージャー
class VisualEffectsManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.emotionMapper = new EmotionMapper();
    this.synapticFlow = new SynapticFlowEffect(canvas, this.ctx);
    this.quantumRipple = new QuantumRippleEffect(canvas, this.ctx);
    
    this.mousePosition = { x: 0, y: 0 };
    this.mouseVelocity = { x: 0, y: 0 };
    this.lastMouseTime = Date.now();
    
    this.setupCanvas();
    this.bindEvents();
    this.startRenderLoop();
  }

  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    this.canvas.addEventListener('click', (e) => {
      this.handleMouseClick(e);
    });
  }

  handleMouseMove(e) {
    const now = Date.now();
    const dt = now - this.lastMouseTime;
    
    const newX = e.clientX;
    const newY = e.clientY;
    
    this.mouseVelocity.x = (newX - this.mousePosition.x) / dt * 16;
    this.mouseVelocity.y = (newY - this.mousePosition.y) / dt * 16;
    
    this.mousePosition.x = newX;
    this.mousePosition.y = newY;
    this.lastMouseTime = now;

    const speed = Math.hypot(this.mouseVelocity.x, this.mouseVelocity.y);
    const mouseData = {
      velocity: this.mouseVelocity,
      acceleration: { x: 0, y: 0 },
      direction: Math.atan2(this.mouseVelocity.y, this.mouseVelocity.x)
    };

    const emotion = this.emotionMapper.analyzeMovement(mouseData);
    const intensity = Math.min(speed / 100, 2.0);

    // エフェクトの生成
    if (speed > 10) {
      this.synapticFlow.createNeuron(newX, newY, intensity);
      this.synapticFlow.triggerPulse(newX, newY, intensity);
    }
  }

  handleMouseClick(e) {
    const intensity = 1.5;
    this.quantumRipple.createRipple(e.clientX, e.clientY, intensity);
    this.synapticFlow.triggerPulse(e.clientX, e.clientY, intensity);
  }

  startRenderLoop() {
    const render = () => {
      this.update();
      this.render();
      requestAnimationFrame(render);
    };
    render();
  }

  update() {
    this.synapticFlow.update();
    this.quantumRipple.update();
  }

  render() {
    // 背景をクリア（フェード効果付き）
    this.ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // エフェクトの描画
    this.synapticFlow.render();
    this.quantumRipple.render();
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VisualEffectsManager,
    EmotionMapper,
    SynapticFlowEffect,
    QuantumRippleEffect
  };
} else if (typeof window !== 'undefined') {
  window.VisualEffectsSystem = {
    VisualEffectsManager,
    EmotionMapper,
    SynapticFlowEffect,
    QuantumRippleEffect
  };
}