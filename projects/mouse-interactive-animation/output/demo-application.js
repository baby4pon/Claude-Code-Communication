/**
 * Demo Application - マウス追従インタラクティブアニメーション
 * 全ての革新的アイデアを統合したデモアプリケーション
 */

import NeuralMotionPredictor from '../src/neural-motion-predictor.js';
import QuantumParticleSwarm from '../src/quantum-particle-swarm.js';
import AdaptivePerformanceSystem from '../src/adaptive-performance-system.js';
import MagnetismUITransformer from '../src/magnetism-ui-transformer.js';

class InteractiveAnimationDemo {
  constructor(containerElement) {
    this.container = containerElement;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    
    // 各システムの初期化
    this.motionPredictor = new NeuralMotionPredictor();
    this.performanceSystem = new AdaptivePerformanceSystem();
    this.magnetismSystem = new MagnetismUITransformer();
    this.particleSwarm = null;
    
    // アニメーション状態
    this.animationFrame = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    
    this.initialize();
  }

  initialize() {
    this.createCanvas();
    this.createUI();
    this.setupEventListeners();
    this.setupPerformanceMonitoring();
    
    // パーティクルシステム初期化
    this.particleSwarm = new QuantumParticleSwarm(this.canvas, 150);
    
    this.start();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // キャンバスサイズ設定
    this.resizeCanvas();
    
    // スタイル設定
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '1';
    this.canvas.style.pointerEvents = 'none';
    
    this.container.appendChild(this.canvas);
  }

  createUI() {
    // コントロールパネル作成
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    controlPanel.innerHTML = `
      <div class="panel-header">
        <h3>インタラクティブアニメーション デモ</h3>
        <div class="performance-display">
          FPS: <span id="fps-display">60</span> | 
          Quality: <span id="quality-display">High</span>
        </div>
      </div>
      
      <div class="controls">
        <div class="control-group">
          <label>磁力の強さ:</label>
          <input type="range" id="magnetism-strength" min="0" max="2" step="0.1" value="1">
          <span id="magnetism-value">1.0</span>
        </div>
        
        <div class="control-group">
          <label>パーティクル数:</label>
          <input type="range" id="particle-count" min="50" max="400" step="50" value="150">
          <span id="particle-value">150</span>
        </div>
        
        <div class="control-group">
          <label>予測深度:</label>
          <input type="range" id="prediction-depth" min="5" max="20" step="1" value="10">
          <span id="prediction-value">10</span>
        </div>
        
        <div class="toggle-group">
          <label>
            <input type="checkbox" id="neural-prediction" checked>
            Neural Prediction
          </label>
          <label>
            <input type="checkbox" id="quantum-effects" checked>
            Quantum Effects
          </label>
          <label>
            <input type="checkbox" id="ui-magnetism" checked>
            UI Magnetism
          </label>
        </div>
      </div>
      
      <div class="demo-elements">
        <div class="magnetic-card" data-magnetic="true">
          <h4>磁性カード 1</h4>
          <p>マウスを近づけてみてください</p>
        </div>
        
        <div class="magnetic-button" data-magnetic="true">
          Click Me!
        </div>
        
        <div class="magnetic-icon" data-magnetic="true">
          ⭐
        </div>
      </div>
    `;
    
    // スタイル適用
    controlPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: 'Arial', sans-serif;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `;
    
    this.container.appendChild(controlPanel);
    this.applyStyles();
  }

  applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .control-panel .panel-header {
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        padding-bottom: 10px;
      }
      
      .control-panel h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      
      .performance-display {
        font-size: 12px;
        color: #4CAF50;
      }
      
      .control-group {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .control-group label {
        font-size: 12px;
        margin-right: 10px;
      }
      
      .control-group input[type="range"] {
        flex: 1;
        margin: 0 10px;
      }
      
      .control-group span {
        font-size: 12px;
        min-width: 30px;
        text-align: center;
      }
      
      .toggle-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .toggle-group label {
        display: flex;
        align-items: center;
        font-size: 12px;
      }
      
      .toggle-group input {
        margin-right: 8px;
      }
      
      .demo-elements {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      .magnetic-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .magnetic-card h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
      }
      
      .magnetic-card p {
        margin: 0;
        font-size: 12px;
        opacity: 0.8;
      }
      
      .magnetic-button {
        background: #FF6B6B;
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        text-align: center;
        cursor: pointer;
        margin-bottom: 10px;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      
      .magnetic-icon {
        font-size: 30px;
        text-align: center;
        cursor: pointer;
        padding: 10px;
        transition: all 0.3s ease;
      }
    `;
    
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // ウィンドウリサイズ
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // マウス移動
    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
    
    // コントロール
    document.getElementById('magnetism-strength').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById('magnetism-value').textContent = value.toFixed(1);
      this.magnetismSystem.setGlobalMagnetStrength(value);
    });
    
    document.getElementById('particle-count').addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('particle-value').textContent = value;
      this.updateParticleCount(value);
    });
    
    document.getElementById('prediction-depth').addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('prediction-value').textContent = value;
      this.motionPredictor.predictionDepth = value;
    });
    
    // トグル機能
    document.getElementById('neural-prediction').addEventListener('change', (e) => {
      this.enableNeuralPrediction = e.target.checked;
    });
    
    document.getElementById('quantum-effects').addEventListener('change', (e) => {
      this.enableQuantumEffects = e.target.checked;
    });
    
    document.getElementById('ui-magnetism').addEventListener('change', (e) => {
      this.magnetismSystem.setActive(e.target.checked);
    });
    
    // 磁性要素の登録
    this.registerMagneticElements();
  }

  registerMagneticElements() {
    const magneticElements = document.querySelectorAll('[data-magnetic="true"]');
    
    magneticElements.forEach((element, index) => {
      this.magnetismSystem.registerElement(element, {
        strength: 1.2,
        maxDistance: 120,
        elasticity: 0.4,
        rotationEnabled: index === 2, // アイコンのみ回転
        scaleEnabled: index === 1     // ボタンのみスケール
      });
    });
  }

  setupPerformanceMonitoring() {
    this.performanceSystem.onQualityChange((quality, metrics) => {
      document.getElementById('quality-display').textContent = quality.name;
      
      // 品質に応じてパーティクル数を調整
      if (this.particleSwarm) {
        this.updateParticleCount(quality.particles);
        document.getElementById('particle-count').value = quality.particles;
        document.getElementById('particle-value').textContent = quality.particles;
      }
    });
    
    this.performanceSystem.onPerformanceUpdate((metrics) => {
      document.getElementById('fps-display').textContent = Math.round(metrics.fps);
    });
  }

  handleMouseMove(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Neural Motion Predictor にデータ追加
    this.motionPredictor.addPosition(mouseX, mouseY);
    
    // Particle Swarm の更新
    if (this.particleSwarm) {
      this.particleSwarm.updateMousePosition(mouseX, mouseY);
    }
  }

  updateParticleCount(count) {
    if (this.particleSwarm) {
      // 既存のパーティクルシステムを更新
      const currentCount = this.particleSwarm.particles.length;
      
      if (count > currentCount) {
        // パーティクル追加
        for (let i = currentCount; i < count; i++) {
          this.particleSwarm.particles.push(new QuantumParticle(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            i
          ));
        }
      } else if (count < currentCount) {
        // パーティクル削除
        this.particleSwarm.particles.splice(count);
      }
      
      this.particleSwarm.particleCount = count;
      this.particleSwarm.createEntanglements();
    }
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  animate(currentTime = 0) {
    if (!this.isRunning) return;
    
    // パフォーマンス測定開始
    this.performanceSystem.startFrameMeasure();
    
    // フレーム時間計算
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    // Neural Prediction の可視化
    if (this.enableNeuralPrediction !== false) {
      this.renderNeuralPredictions();
    }
    
    // Quantum Particle Swarm の更新と描画
    if (this.enableQuantumEffects !== false && this.particleSwarm) {
      this.particleSwarm.update();
      this.particleSwarm.render();
    }
    
    // パフォーマンス測定終了
    this.performanceSystem.endFrameMeasure();
    
    // 次のフレーム
    this.animationFrame = requestAnimationFrame((time) => this.animate(time));
  }

  renderNeuralPredictions() {
    const predictions = this.motionPredictor.predictNextPositions();
    
    if (predictions.length > 0) {
      this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(predictions[0].x, predictions[0].y);
      
      predictions.forEach((prediction, index) => {
        const alpha = prediction.confidence;
        const radius = 3 * alpha;
        
        // 予測点の描画
        this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(prediction.x, prediction.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 予測軌道の描画
        if (index > 0) {
          this.ctx.lineTo(prediction.x, prediction.y);
        }
      });
      
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  destroy() {
    this.stop();
    
    if (this.performanceSystem) {
      this.performanceSystem.destroy();
    }
    
    if (this.magnetismSystem) {
      this.magnetismSystem.destroy();
    }
    
    // DOM要素の削除
    if (this.canvas) {
      this.canvas.remove();
    }
    
    const controlPanel = this.container.querySelector('.control-panel');
    if (controlPanel) {
      controlPanel.remove();
    }
  }
}

// エクスポート
export default InteractiveAnimationDemo;

// 使用例
export const initializeDemo = (containerSelector = 'body') => {
  const container = document.querySelector(containerSelector);
  if (container) {
    return new InteractiveAnimationDemo(container);
  } else {
    console.error('Container element not found');
  }
};