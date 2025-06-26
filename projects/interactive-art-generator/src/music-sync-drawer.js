/**
 * 音楽シンクロ描画機能
 * 音響分析とビジュアル生成の融合
 */
class MusicSyncDrawer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.frequencyData = null;
        this.isListening = false;
        this.visualizationMode = 'frequency'; // frequency, waveform, spectrum
        this.musicGenre = 'unknown';
        this.beatDetection = {
            threshold: 0.8,
            lastBeat: 0,
            sensitivity: 1.0
        };
    }

    /**
     * 音声入力を初期化
     */
    async initializeAudio() {
        try {
            // マイクロフォンアクセス許可を要求
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            
            // Web Audio API セットアップ
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            // アナライザー設定
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.3;
            
            this.microphone.connect(this.analyser);
            
            // 周波数データ配列を初期化
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.isListening = true;
            console.log('音声入力が初期化されました');
            
            return true;
        } catch (error) {
            console.warn('音声入力の初期化に失敗しました:', error);
            return false;
        }
    }

    /**
     * 音響データを分析
     */
    analyzeAudio() {
        if (!this.isListening || !this.analyser) {
            return this.getDefaultAudioData();
        }
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        // 基本的な音響特徴量を抽出
        const audioFeatures = this.extractAudioFeatures(this.frequencyData);
        
        // 音楽ジャンルを推定
        this.musicGenre = this.detectMusicGenre(audioFeatures);
        
        return audioFeatures;
    }

    /**
     * 音響特徴量を抽出
     */
    extractAudioFeatures(frequencyData) {
        const length = frequencyData.length;
        
        // 周波数帯域別のエネルギー計算
        const bassRange = Math.floor(length * 0.1);
        const midRange = Math.floor(length * 0.3);
        const highRange = Math.floor(length * 0.6);
        
        let bass = 0, mid = 0, high = 0;
        
        for (let i = 0; i < bassRange; i++) {
            bass += frequencyData[i];
        }
        for (let i = bassRange; i < midRange; i++) {
            mid += frequencyData[i];
        }
        for (let i = midRange; i < highRange; i++) {
            high += frequencyData[i];
        }
        
        bass /= bassRange;
        mid /= (midRange - bassRange);
        high /= (highRange - midRange);
        
        // 全体のエネルギーレベル
        const totalEnergy = (bass + mid + high) / 3;
        
        // ビート検出
        const currentTime = Date.now();
        const isBeat = this.detectBeat(bass, currentTime);
        
        // スペクトル重心（音色の明るさ）
        const spectralCentroid = this.calculateSpectralCentroid(frequencyData);
        
        return {
            bass: bass / 255,
            mid: mid / 255,
            high: high / 255,
            energy: totalEnergy / 255,
            isBeat,
            spectralCentroid,
            rawFrequencyData: frequencyData
        };
    }

    /**
     * ビート検出
     */
    detectBeat(bassLevel, currentTime) {
        const timeSinceLastBeat = currentTime - this.beatDetection.lastBeat;
        const threshold = this.beatDetection.threshold * this.beatDetection.sensitivity;
        
        if (bassLevel > threshold && timeSinceLastBeat > 300) { // 最小300ms間隔
            this.beatDetection.lastBeat = currentTime;
            return true;
        }
        
        return false;
    }

    /**
     * スペクトル重心を計算
     */
    calculateSpectralCentroid(frequencyData) {
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            numerator += i * frequencyData[i];
            denominator += frequencyData[i];
        }
        
        return denominator > 0 ? numerator / denominator : 0;
    }

    /**
     * 音楽ジャンルを推定
     */
    detectMusicGenre(audioFeatures) {
        const { bass, mid, high, energy } = audioFeatures;
        
        if (bass > 0.7 && energy > 0.6) {
            return 'electronic';
        } else if (mid > 0.6 && high > 0.5) {
            return 'rock';
        } else if (high > 0.7) {
            return 'classical';
        } else if (bass > 0.5 && mid > 0.4) {
            return 'jazz';
        } else {
            return 'ambient';
        }
    }

    /**
     * デフォルトの音響データ（音声入力がない場合）
     */
    getDefaultAudioData() {
        const time = Date.now() * 0.001;
        return {
            bass: 0.3 + Math.sin(time * 0.5) * 0.2,
            mid: 0.4 + Math.cos(time * 0.7) * 0.2,
            high: 0.2 + Math.sin(time * 1.2) * 0.1,
            energy: 0.3 + Math.sin(time * 0.3) * 0.2,
            isBeat: Math.sin(time * 2) > 0.8,
            spectralCentroid: 0.5,
            rawFrequencyData: new Uint8Array(1024).fill(128)
        };
    }

    /**
     * 描画開始
     */
    startDrawing(x, y) {
        this.currentPath = {
            points: [{ x, y }],
            startTime: Date.now(),
            audioSnapshot: this.analyzeAudio()
        };
    }

    /**
     * 音楽に同期した描画
     */
    draw(x, y) {
        if (!this.currentPath) return;
        
        const audioFeatures = this.analyzeAudio();
        const point = { x, y, audio: audioFeatures };
        this.currentPath.points.push(point);
        
        // 音響データに基づいてリアルタイム描画
        this.drawMusicSyncLine(this.currentPath, audioFeatures);
    }

    /**
     * 音楽同期線を描画
     */
    drawMusicSyncLine(path, audioFeatures) {
        if (path.points.length < 2) return;
        
        const points = path.points;
        const lastIndex = points.length - 1;
        const currentPoint = points[lastIndex];
        const prevPoint = points[lastIndex - 1];
        
        // 音響データに基づく描画パラメータ
        const color = this.generateMusicColor(audioFeatures);
        const lineWidth = this.calculateMusicLineWidth(audioFeatures);
        const effects = this.getMusicEffects(audioFeatures);
        
        // 基本線の描画
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(prevPoint.x, prevPoint.y);
        
        // 音響データに応じた描画効果
        if (effects.vibration) {
            this.drawVibratingLine(prevPoint, currentPoint, audioFeatures);
        } else if (effects.harmony) {
            this.drawHarmonyLine(prevPoint, currentPoint, audioFeatures);
        } else {
            this.ctx.lineTo(currentPoint.x, currentPoint.y);
        }
        
        this.ctx.stroke();
        
        // 追加効果
        if (audioFeatures.isBeat) {
            this.addBeatEffect(currentPoint.x, currentPoint.y, audioFeatures);
        }
        
        if (audioFeatures.energy > 0.8) {
            this.addEnergyParticles(currentPoint.x, currentPoint.y, audioFeatures);
        }
    }

    /**
     * 音楽に基づく色生成
     */
    generateMusicColor(audioFeatures) {
        const { bass, mid, high, energy } = audioFeatures;
        
        let hue, saturation, lightness;
        
        switch (this.musicGenre) {
            case 'electronic':
                hue = (bass * 120 + mid * 180) % 360;
                saturation = 70 + energy * 30;
                lightness = 40 + high * 40;
                break;
            case 'rock':
                hue = (mid * 60 + high * 30) % 360;
                saturation = 80 + bass * 20;
                lightness = 50 + energy * 30;
                break;
            case 'classical':
                hue = 200 + high * 160;
                saturation = 50 + mid * 30;
                lightness = 60 + energy * 20;
                break;
            case 'jazz':
                hue = 30 + bass * 90;
                saturation = 60 + mid * 25;
                lightness = 45 + high * 35;
                break;
            default: // ambient
                hue = 240 + energy * 120;
                saturation = 40 + (bass + mid + high) * 20;
                lightness = 50 + energy * 25;
        }
        
        const alpha = 0.6 + energy * 0.4;
        return `hsla(${hue % 360}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    /**
     * 音楽に基づく線幅計算
     */
    calculateMusicLineWidth(audioFeatures) {
        const { bass, energy, isBeat } = audioFeatures;
        let baseWidth = 2 + bass * 8;
        
        if (isBeat) {
            baseWidth *= 1.5;
        }
        
        return baseWidth + energy * 5;
    }

    /**
     * 音楽効果を取得
     */
    getMusicEffects(audioFeatures) {
        const { bass, mid, high, energy } = audioFeatures;
        
        return {
            vibration: bass > 0.6,
            harmony: mid > 0.7 && high > 0.5,
            particles: energy > 0.8,
            beat: audioFeatures.isBeat
        };
    }

    /**
     * 振動線を描画
     */
    drawVibratingLine(startPoint, endPoint, audioFeatures) {
        const segments = 10;
        const vibrationIntensity = audioFeatures.bass * 5;
        
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = startPoint.x + (endPoint.x - startPoint.x) * t;
            const y = startPoint.y + (endPoint.y - startPoint.y) * t;
            
            const vibration = Math.sin(t * Math.PI * 6 + Date.now() * 0.01) * vibrationIntensity;
            const perpX = -(endPoint.y - startPoint.y) / Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)) * vibration;
            const perpY = (endPoint.x - startPoint.x) / Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)) * vibration;
            
            this.ctx.lineTo(x + perpX, y + perpY);
        }
    }

    /**
     * ハーモニー線を描画
     */
    drawHarmonyLine(startPoint, endPoint, audioFeatures) {
        const harmonies = 3;
        
        for (let h = 0; h < harmonies; h++) {
            const offset = (h - 1) * 3;
            const alpha = 1 - (h * 0.3);
            
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.moveTo(startPoint.x + offset, startPoint.y + offset);
            this.ctx.lineTo(endPoint.x + offset, endPoint.y + offset);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * ビート効果
     */
    addBeatEffect(x, y, audioFeatures) {
        const intensity = audioFeatures.energy;
        const radius = 10 + intensity * 20;
        
        // パルス円
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + intensity * 0.5})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 内部パーティクル
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const particleX = x + Math.cos(angle) * radius * 0.5;
            const particleY = y + Math.sin(angle) * radius * 0.5;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * エネルギーパーティクル
     */
    addEnergyParticles(x, y, audioFeatures) {
        const particleCount = Math.floor(audioFeatures.energy * 8);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            const size = 1 + Math.random() * 3;
            
            this.ctx.fillStyle = this.generateMusicColor(audioFeatures);
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * 描画終了
     */
    endDrawing() {
        this.currentPath = null;
    }

    /**
     * 音声入力停止
     */
    stopListening() {
        this.isListening = false;
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    /**
     * 感度調整
     */
    setSensitivity(sensitivity) {
        this.beatDetection.sensitivity = sensitivity;
    }

    /**
     * 可視化モード設定
     */
    setVisualizationMode(mode) {
        this.visualizationMode = mode;
    }

    /**
     * 音響情報を取得
     */
    getAudioInfo() {
        const audioFeatures = this.analyzeAudio();
        return {
            isListening: this.isListening,
            musicGenre: this.musicGenre,
            audioFeatures: audioFeatures,
            visualizationMode: this.visualizationMode
        };
    }
}