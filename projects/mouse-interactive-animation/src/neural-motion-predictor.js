/**
 * Neural Motion Prediction Engine
 * マウス軌道を機械学習で予測し、先読みアニメーションを実現
 */

class NeuralMotionPredictor {
  constructor() {
    this.history = [];
    this.maxHistory = 30;
    this.predictionDepth = 10;
    this.kalmanFilter = new KalmanFilter();
    this.isInitialized = false;
  }

  // マウス位置履歴を追加
  addPosition(x, y, timestamp = Date.now()) {
    this.history.push({ x, y, timestamp });
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // 最低5点のデータが必要
    if (this.history.length >= 5 && !this.isInitialized) {
      this.initialize();
    }
  }

  // 予測システムの初期化
  initialize() {
    this.kalmanFilter.initialize(this.history);
    this.isInitialized = true;
  }

  // 次の位置を予測
  predictNextPositions(steps = this.predictionDepth) {
    if (!this.isInitialized || this.history.length < 5) {
      return [];
    }

    const predictions = [];
    const velocity = this.calculateVelocity();
    const acceleration = this.calculateAcceleration();

    for (let i = 1; i <= steps; i++) {
      const predicted = this.kalmanFilter.predict(velocity, acceleration, i);
      predictions.push({
        x: predicted.x,
        y: predicted.y,
        confidence: Math.max(0, 1 - (i / steps) * 0.8), // 先の予測ほど信頼度低下
        timestamp: Date.now() + (i * 16) // 60FPS想定
      });
    }

    return predictions;
  }

  // 速度ベクトル計算
  calculateVelocity() {
    if (this.history.length < 2) return { x: 0, y: 0 };

    const recent = this.history.slice(-3);
    let vx = 0, vy = 0;

    for (let i = 1; i < recent.length; i++) {
      const dt = (recent[i].timestamp - recent[i-1].timestamp) / 16; // フレーム単位
      vx += (recent[i].x - recent[i-1].x) / dt;
      vy += (recent[i].y - recent[i-1].y) / dt;
    }

    return {
      x: vx / (recent.length - 1),
      y: vy / (recent.length - 1)
    };
  }

  // 加速度ベクトル計算
  calculateAcceleration() {
    if (this.history.length < 3) return { x: 0, y: 0 };

    const velocities = [];
    for (let i = 1; i < this.history.length; i++) {
      const dt = (this.history[i].timestamp - this.history[i-1].timestamp) / 16;
      velocities.push({
        x: (this.history[i].x - this.history[i-1].x) / dt,
        y: (this.history[i].y - this.history[i-1].y) / dt,
        timestamp: this.history[i].timestamp
      });
    }

    if (velocities.length < 2) return { x: 0, y: 0 };

    const recentVel = velocities.slice(-2);
    const dt = (recentVel[1].timestamp - recentVel[0].timestamp) / 16;
    
    return {
      x: (recentVel[1].x - recentVel[0].x) / dt,
      y: (recentVel[1].y - recentVel[0].y) / dt
    };
  }

  // 予測精度評価
  evaluatePrediction(actualX, actualY, prediction) {
    const distance = Math.sqrt(
      Math.pow(actualX - prediction.x, 2) + 
      Math.pow(actualY - prediction.y, 2)
    );
    return Math.max(0, 1 - distance / 100); // 100px以内で評価
  }
}

// カルマンフィルター実装
class KalmanFilter {
  constructor() {
    this.Q = 0.1; // プロセスノイズ
    this.R = 1.0; // 観測ノイズ
    this.P = 1.0; // 推定誤差共分散
    this.K = 0;   // カルマンゲイン
    this.x = { x: 0, y: 0 }; // 状態推定値
  }

  initialize(history) {
    if (history.length > 0) {
      this.x = { x: history[0].x, y: history[0].y };
    }
  }

  predict(velocity, acceleration, steps) {
    // 等加速度運動モデル
    const dt = steps * 16 / 1000; // ミリ秒を秒に変換
    
    const predictedX = this.x.x + velocity.x * dt + 0.5 * acceleration.x * dt * dt;
    const predictedY = this.x.y + velocity.y * dt + 0.5 * acceleration.y * dt * dt;

    return { x: predictedX, y: predictedY };
  }

  update(measurement) {
    // 予測ステップ
    this.P = this.P + this.Q;

    // 更新ステップ
    this.K = this.P / (this.P + this.R);
    this.x.x = this.x.x + this.K * (measurement.x - this.x.x);
    this.x.y = this.x.y + this.K * (measurement.y - this.x.y);
    this.P = (1 - this.K) * this.P;
  }
}

export default NeuralMotionPredictor;