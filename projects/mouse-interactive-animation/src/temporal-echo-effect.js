/**
 * Temporal Echo Chamber Effect
 * 時間の重層性を可視化するエフェクトシステム
 */

class TemporalEchoEffect {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.echoes = [];
    this.trailPoints = [];
    this.maxEchoes = 8;
    this.maxTrailPoints = 200;
    this.timeDecay = 0.98;
  }

  addMousePosition(x, y, intensity = 1.0) {
    const timestamp = Date.now();
    
    // 新しいトレイルポイントを追加
    const trailPoint = {
      x, y,
      timestamp,
      intensity,
      life: 1.0,
      hue: (timestamp * 0.1) % 360
    };
    
    this.trailPoints.push(trailPoint);
    
    // 古いポイントを削除
    if (this.trailPoints.length > this.maxTrailPoints) {
      this.trailPoints.shift();
    }

    // エコーの生成（一定間隔で）
    if (this.trailPoints.length % 25 === 0) {
      this.createEcho();
    }
  }

  createEcho() {
    if (this.trailPoints.length < 10) return;

    const recentPoints = this.trailPoints.slice(-50);
    const echo = {
      points: recentPoints.map(point => ({
        x: point.x,
        y: point.y,
        intensity: point.intensity
      })),
      life: 1.0,
      delay: Math.random() * 2000 + 500, // 0.5-2.5秒の遅延
      startTime: Date.now(),
      hue: (Date.now() * 0.05) % 360,
      opacity: 0.6 + Math.random() * 0.4
    };

    this.echoes.push(echo);
    
    if (this.echoes.length > this.maxEchoes) {
      this.echoes.shift();
    }
  }

  update() {
    const now = Date.now();

    // トレイルポイントの更新
    this.trailPoints = this.trailPoints.filter(point => {
      const age = now - point.timestamp;
      point.life = Math.max(0, 1 - (age / 5000)); // 5秒で消失
      return point.life > 0;
    });

    // エコーの更新
    this.echoes = this.echoes.filter(echo => {
      const elapsed = now - echo.startTime;
      
      if (elapsed > echo.delay) {
        echo.life -= 0.01;
      }
      
      return echo.life > 0;
    });
  }

  render() {
    this.ctx.save();
    
    // 現在のトレイルを描画
    this.renderCurrentTrail();
    
    // エコーを描画
    this.renderEchoes();
    
    this.ctx.restore();
  }

  renderCurrentTrail() {
    if (this.trailPoints.length < 2) return;

    const points = this.trailPoints.slice();
    
    // スムーズな曲線として描画
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      const nextPoint = points[i + 1];
      
      const cpX = (point.x + nextPoint.x) / 2;
      const cpY = (point.y + nextPoint.y) / 2;
      
      this.ctx.quadraticCurveTo(point.x, point.y, cpX, cpY);
    }
    
    // グラデーションストローク
    const gradient = this.ctx.createLinearGradient(
      points[0].x, points[0].y,
      points[points.length - 1].x, points[points.length - 1].y
    );
    
    const currentTime = Date.now();
    points.forEach((point, index) => {
      const progress = index / points.length;
      const age = currentTime - point.timestamp;
      const alpha = Math.max(0, 1 - age / 3000) * point.life;
      
      gradient.addColorStop(
        progress,
        `hsla(${point.hue}, 70%, 60%, ${alpha * 0.8})`
      );
    });
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    // パーティクル効果
    this.renderTrailParticles();
  }

  renderTrailParticles() {
    const now = Date.now();
    
    this.trailPoints.forEach((point, index) => {
      if (index % 5 !== 0) return; // 一部のポイントのみパーティクル化
      
      const age = now - point.timestamp;
      const life = Math.max(0, 1 - age / 3000);
      
      if (life > 0.3) {
        const size = 2 + point.intensity * 3 * life;
        const alpha = life * 0.6;
        
        const gradient = this.ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 2
        );
        gradient.addColorStop(0, `hsla(${point.hue}, 80%, 70%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${point.hue}, 80%, 50%, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  renderEchoes() {
    const now = Date.now();
    
    this.echoes.forEach(echo => {
      const elapsed = now - echo.startTime;
      
      if (elapsed < echo.delay) return; // まだ遅延中
      
      const echoAge = elapsed - echo.delay;
      const echoLife = Math.max(0, echo.life);
      
      if (echoLife <= 0 || echo.points.length < 2) return;

      // エコーの透明度計算
      const baseAlpha = echo.opacity * echoLife;
      const flickerAlpha = baseAlpha * (0.7 + 0.3 * Math.sin(echoAge * 0.01));
      
      // エコーパス描画
      this.ctx.save();
      this.ctx.globalAlpha = flickerAlpha;
      
      this.ctx.beginPath();
      this.ctx.moveTo(echo.points[0].x, echo.points[0].y);
      
      for (let i = 1; i < echo.points.length - 1; i++) {
        const point = echo.points[i];
        const nextPoint = echo.points[i + 1];
        
        const cpX = (point.x + nextPoint.x) / 2;
        const cpY = (point.y + nextPoint.y) / 2;
        
        this.ctx.quadraticCurveTo(point.x, point.y, cpX, cpY);
      }
      
      // エコー特有の視覚効果
      this.ctx.strokeStyle = `hsl(${echo.hue}, 60%, 55%)`;
      this.ctx.lineWidth = 2 * echoLife;
      this.ctx.lineCap = 'round';
      this.ctx.setLineDash([5, 5]); // 破線効果
      this.ctx.lineDashOffset = -echoAge * 0.1; // アニメーション
      this.ctx.stroke();
      
      // グロー効果
      this.ctx.shadowColor = `hsl(${echo.hue}, 80%, 60%)`;
      this.ctx.shadowBlur = 8 * echoLife;
      this.ctx.stroke();
      
      this.ctx.restore();
      
      // エコーポイント描画
      this.renderEchoPoints(echo, flickerAlpha);
    });
  }

  renderEchoPoints(echo, alpha) {
    echo.points.forEach((point, index) => {
      if (index % 8 !== 0) return; // スパースなポイント
      
      const size = 1 + point.intensity * 2 * echo.life;
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha * 0.7;
      
      const gradient = this.ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, size * 3
      );
      gradient.addColorStop(0, `hsl(${echo.hue}, 70%, 70%)`);
      gradient.addColorStop(1, `hsl(${echo.hue}, 70%, 40%)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  // 時間の歪み効果
  createTimeDistortion(x, y, intensity) {
    const distortion = {
      x, y,
      intensity,
      radius: 0,
      maxRadius: 80 + intensity * 40,
      life: 1.0,
      startTime: Date.now()
    };

    // 周辺のトレイルポイントに影響を与える
    this.trailPoints.forEach(point => {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < 100) {
        const factor = 1 - (distance / 100);
        point.hue = (point.hue + intensity * factor * 60) % 360;
        point.intensity *= (1 + factor * 0.5);
      }
    });
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemporalEchoEffect };
} else if (typeof window !== 'undefined') {
  window.TemporalEchoEffect = TemporalEchoEffect;
}