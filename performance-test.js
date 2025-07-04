// パフォーマンステスト・最適化システム
class PerformanceOptimizer {
    constructor() {
        this.benchmarks = {
            quantum: null,
            fractal: null,
            fluid: null,
            webgl: null
        };
        
        this.performanceMetrics = {
            fps: [],
            frameTime: [],
            particleCount: [],
            memoryUsage: [],
            gpuMemory: []
        };
        
        this.optimizationSettings = {
            adaptiveParticleCount: true,
            dynamicLOD: true,
            culling: true,
            batching: true,
            memoryPooling: true
        };
        
        this.targetFPS = 60;
        this.minFPS = 30;
        this.maxParticles = 10000;
        this.lastFrameTime = performance.now();
    }
    
    // 包括的なベンチマークテスト
    async runComprehensiveBenchmark() {
        console.log('🚀 包括的パフォーマンステスト開始');
        
        const results = {
            quantum: await this.benchmarkQuantumSystem(),
            fractal: await this.benchmarkFractalSystem(),
            fluid: await this.benchmarkFluidSystem(),
            webgl: await this.benchmarkWebGLSystem(),
            memory: await this.benchmarkMemoryUsage(),
            overall: null
        };
        
        results.overall = this.calculateOverallScore(results);
        
        console.log('📊 ベンチマーク結果:', results);
        return results;
    }
    
    // 量子システムベンチマーク
    async benchmarkQuantumSystem() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            
            const system = new QuantumParticleSystem(canvas);
            const metrics = {
                particleCounts: [100, 500, 1000, 2000, 5000],
                avgFPS: [],
                minFPS: [],
                maxFPS: [],
                memoryUsage: []
            };
            
            let testIndex = 0;
            
            const runTest = () => {
                if (testIndex >= metrics.particleCounts.length) {
                    resolve({
                        name: 'Quantum Resonance',
                        maxStableParticles: this.findMaxStableParticles(metrics),
                        avgPerformance: this.calculateAverage(metrics.avgFPS),
                        metrics: metrics
                    });
                    return;
                }
                
                const particleCount = metrics.particleCounts[testIndex];
                system.particleCount = particleCount;
                system.initializeParticles();
                
                this.measurePerformance(system, 3000, (results) => {
                    metrics.avgFPS.push(results.avgFPS);
                    metrics.minFPS.push(results.minFPS);
                    metrics.maxFPS.push(results.maxFPS);
                    metrics.memoryUsage.push(this.getMemoryUsage());
                    
                    testIndex++;
                    setTimeout(runTest, 1000); // 1秒待機してから次のテスト
                });
            };
            
            runTest();
        });
    }
    
    // フラクタルシステムベンチマーク
    async benchmarkFractalSystem() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            
            const system = new FractalExplosionEngine(canvas);
            const metrics = {
                explosionCounts: [1, 3, 5, 10, 20],
                avgFPS: [],
                complexityScores: []
            };
            
            let testIndex = 0;
            
            const runTest = () => {
                if (testIndex >= metrics.explosionCounts.length) {
                    resolve({
                        name: 'Fractal Explosion',
                        maxConcurrentExplosions: this.findMaxConcurrentExplosions(metrics),
                        avgPerformance: this.calculateAverage(metrics.avgFPS),
                        metrics: metrics
                    });
                    return;
                }
                
                const explosionCount = metrics.explosionCounts[testIndex];
                
                // 複数の爆発を同時発生
                for (let i = 0; i < explosionCount; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    system.createExplosion(x, y, 1.0, 0, 3);
                }
                
                this.measurePerformance(system, 5000, (results) => {
                    metrics.avgFPS.push(results.avgFPS);
                    metrics.complexityScores.push(explosionCount * results.avgFPS);
                    
                    testIndex++;
                    setTimeout(runTest, 2000);
                });
            };
            
            runTest();
        });
    }
    
    // 流体システムベンチマーク
    async benchmarkFluidSystem() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            
            const system = new FluidDynamicsSimulation(canvas);
            const metrics = {
                particleCounts: [100, 300, 500, 800, 1000],
                avgFPS: [],
                sphCalculations: []
            };
            
            let testIndex = 0;
            
            const runTest = () => {
                if (testIndex >= metrics.particleCounts.length) {
                    resolve({
                        name: 'Fluid Dynamics (SPH)',
                        maxFluidParticles: this.findMaxFluidParticles(metrics),
                        sphEfficiency: this.calculateSPHEfficiency(metrics),
                        metrics: metrics
                    });
                    return;
                }
                
                const particleCount = metrics.particleCounts[testIndex];
                system.particleCount = particleCount;
                system.initializeParticles();
                
                this.measurePerformance(system, 4000, (results) => {
                    metrics.avgFPS.push(results.avgFPS);
                    metrics.sphCalculations.push(this.calculateSPHComplexity(particleCount));
                    
                    testIndex++;
                    setTimeout(runTest, 1500);
                });
            };
            
            runTest();
        });
    }
    
    // WebGLシステムベンチマーク
    async benchmarkWebGLSystem() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            
            try {
                const system = new WebGLParticleSystem(canvas);
                const metrics = {
                    particleCounts: [1000, 5000, 10000, 20000, 50000],
                    avgFPS: [],
                    gpuUsage: []
                };
                
                let testIndex = 0;
                
                const runTest = () => {
                    if (testIndex >= metrics.particleCounts.length) {
                        resolve({
                            name: 'WebGL GPU Accelerated',
                            maxGPUParticles: this.findMaxGPUParticles(metrics),
                            gpuEfficiency: this.calculateGPUEfficiency(metrics),
                            metrics: metrics
                        });
                        return;
                    }
                    
                    const particleCount = metrics.particleCounts[testIndex];
                    system.setParticleCount(particleCount);
                    
                    this.measurePerformance(system, 3000, (results) => {
                        metrics.avgFPS.push(results.avgFPS);
                        metrics.gpuUsage.push(this.estimateGPUUsage(particleCount));
                        
                        testIndex++;
                        setTimeout(runTest, 1000);
                    });
                };
                
                runTest();
            } catch (error) {
                resolve({
                    name: 'WebGL GPU Accelerated',
                    error: 'WebGL2 not supported',
                    supported: false
                });
            }
        });
    }
    
    // メモリ使用量ベンチマーク
    async benchmarkMemoryUsage() {
        const initialMemory = this.getMemoryUsage();
        
        // 大量のパーティクルを生成してメモリリークをテスト
        const testSizes = [1000, 5000, 10000, 20000];
        const memorySnapshots = [];
        
        for (let size of testSizes) {
            const particles = [];
            
            // パーティクルを大量生成
            for (let i = 0; i < size; i++) {
                particles.push({
                    position: { x: Math.random() * 1000, y: Math.random() * 1000 },
                    velocity: { x: Math.random(), y: Math.random() },
                    color: { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 },
                    life: Math.random()
                });
            }
            
            await this.waitForGC(); // ガベージコレクションを待つ
            
            const currentMemory = this.getMemoryUsage();
            memorySnapshots.push({
                particleCount: size,
                memoryUsed: currentMemory - initialMemory,
                memoryPerParticle: (currentMemory - initialMemory) / size
            });
        }
        
        return {
            name: 'Memory Usage Analysis',
            snapshots: memorySnapshots,
            memoryEfficiency: this.calculateMemoryEfficiency(memorySnapshots)
        };
    }
    
    // パフォーマンス測定
    measurePerformance(system, duration, callback) {
        const startTime = performance.now();
        const fps = [];
        let frameCount = 0;
        let lastFrameTime = startTime;
        
        const measure = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            
            if (deltaTime > 0) {
                const currentFPS = 1000 / deltaTime;
                fps.push(currentFPS);
            }
            
            lastFrameTime = currentTime;
            frameCount++;
            
            if (currentTime - startTime < duration) {
                requestAnimationFrame(measure);
            } else {
                const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
                const minFPS = Math.min(...fps);
                const maxFPS = Math.max(...fps);
                
                callback({
                    avgFPS: avgFPS,
                    minFPS: minFPS,
                    maxFPS: maxFPS,
                    frameCount: frameCount,
                    testDuration: duration
                });
            }
        };
        
        requestAnimationFrame(measure);
    }
    
    // アダプティブパフォーマンス最適化
    optimizePerformance(currentSystem, currentFPS, particleCount) {
        if (!this.optimizationSettings.adaptiveParticleCount) return particleCount;
        
        let newParticleCount = particleCount;
        
        if (currentFPS < this.minFPS) {
            // パフォーマンスが低い場合は粒子数を減らす
            newParticleCount = Math.max(100, Math.floor(particleCount * 0.8));
            console.log(`🔻 パフォーマンス最適化: 粒子数を ${particleCount} → ${newParticleCount} に削減`);
        } else if (currentFPS > this.targetFPS + 10 && particleCount < this.maxParticles) {
            // パフォーマンスに余裕がある場合は粒子数を増やす
            newParticleCount = Math.min(this.maxParticles, Math.floor(particleCount * 1.2));
            console.log(`🔺 パフォーマンス最適化: 粒子数を ${particleCount} → ${newParticleCount} に増加`);
        }
        
        return newParticleCount;
    }
    
    // メモリ使用量取得
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }
    
    // ガベージコレクション待機
    async waitForGC() {
        return new Promise(resolve => {
            setTimeout(() => {
                if (window.gc) {
                    window.gc();
                }
                resolve();
            }, 100);
        });
    }
    
    // ヘルパー関数群
    findMaxStableParticles(metrics) {
        for (let i = 0; i < metrics.avgFPS.length; i++) {
            if (metrics.avgFPS[i] < this.minFPS) {
                return i > 0 ? metrics.particleCounts[i - 1] : metrics.particleCounts[0];
            }
        }
        return metrics.particleCounts[metrics.particleCounts.length - 1];
    }
    
    findMaxConcurrentExplosions(metrics) {
        for (let i = 0; i < metrics.avgFPS.length; i++) {
            if (metrics.avgFPS[i] < this.minFPS) {
                return i > 0 ? metrics.explosionCounts[i - 1] : metrics.explosionCounts[0];
            }
        }
        return metrics.explosionCounts[metrics.explosionCounts.length - 1];
    }
    
    findMaxFluidParticles(metrics) {
        return this.findMaxStableParticles(metrics);
    }
    
    findMaxGPUParticles(metrics) {
        return this.findMaxStableParticles(metrics);
    }
    
    calculateAverage(array) {
        return array.reduce((a, b) => a + b, 0) / array.length;
    }
    
    calculateSPHComplexity(particleCount) {
        // SPHアルゴリズムの計算複雑度は O(n²) に近い
        return particleCount * particleCount * 0.001;
    }
    
    calculateSPHEfficiency(metrics) {
        const complexityToFPS = metrics.sphCalculations.map((complexity, i) => 
            metrics.avgFPS[i] / complexity
        );
        return this.calculateAverage(complexityToFPS);
    }
    
    estimateGPUUsage(particleCount) {
        // GPU使用率の推定（簡易）
        return Math.min(100, (particleCount / 50000) * 100);
    }
    
    calculateGPUEfficiency(metrics) {
        const efficiencyScores = metrics.avgFPS.map((fps, i) => 
            fps / (metrics.gpuUsage[i] + 1)
        );
        return this.calculateAverage(efficiencyScores);
    }
    
    calculateMemoryEfficiency(snapshots) {
        const avgMemoryPerParticle = this.calculateAverage(
            snapshots.map(s => s.memoryPerParticle)
        );
        return 1000 / avgMemoryPerParticle; // 効率性スコア
    }
    
    calculateOverallScore(results) {
        const scores = {
            quantum: results.quantum.avgPerformance || 0,
            fractal: results.fractal.avgPerformance || 0,
            fluid: results.fluid.avgPerformance || 0,
            webgl: results.webgl.avgPerformance || 0,
            memory: results.memory.memoryEfficiency || 0
        };
        
        const weightedScore = (
            scores.quantum * 0.25 +
            scores.fractal * 0.2 +
            scores.fluid * 0.2 +
            scores.webgl * 0.25 +
            scores.memory * 0.1
        );
        
        return {
            overallScore: weightedScore,
            individualScores: scores,
            recommendation: this.generateRecommendation(results)
        };
    }
    
    generateRecommendation(results) {
        const recommendations = [];
        
        if (results.webgl.avgPerformance > results.quantum.avgPerformance * 2) {
            recommendations.push('WebGL実装を優先使用することを推奨');
        }
        
        if (results.memory.memoryEfficiency < 50) {
            recommendations.push('メモリ使用量の最適化が必要');
        }
        
        if (results.fluid.avgPerformance < 30) {
            recommendations.push('流体シミュレーションの粒子数制限を推奨');
        }
        
        return recommendations;
    }
}

// リアルタイムパフォーマンスモニター
class RealTimePerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            frameTime: [],
            memory: []
        };
        this.maxSamples = 300; // 5分間のデータ保持
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        const monitor = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            
            if (deltaTime > 0) {
                const fps = 1000 / deltaTime;
                this.addMetric('fps', fps);
                this.addMetric('frameTime', deltaTime);
            }
            
            // メモリ使用量（1秒ごと）
            if (this.frameCount % 60 === 0) {
                const memoryUsage = performance.memory ? 
                    performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
                this.addMetric('memory', memoryUsage);
            }
            
            this.lastFrameTime = currentTime;
            this.frameCount++;
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }
    
    addMetric(type, value) {
        this.metrics[type].push({
            timestamp: performance.now(),
            value: value
        });
        
        // 古いデータを削除
        if (this.metrics[type].length > this.maxSamples) {
            this.metrics[type].shift();
        }
    }
    
    getCurrentMetrics() {
        const getAverage = (type) => {
            const recent = this.metrics[type].slice(-60); // 直近60フレーム
            if (recent.length === 0) return 0;
            return recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        };
        
        return {
            fps: getAverage('fps'),
            frameTime: getAverage('frameTime'),
            memory: this.metrics.memory.length > 0 ? 
                this.metrics.memory[this.metrics.memory.length - 1].value : 0
        };
    }
    
    getPerformanceAnalysis() {
        const current = this.getCurrentMetrics();
        
        const analysis = {
            status: 'good',
            issues: [],
            recommendations: []
        };
        
        if (current.fps < 30) {
            analysis.status = 'poor';
            analysis.issues.push('低フレームレート');
            analysis.recommendations.push('粒子数の削減');
        } else if (current.fps < 50) {
            analysis.status = 'moderate';
            analysis.issues.push('フレームレート低下');
        }
        
        if (current.frameTime > 33) {
            analysis.issues.push('フレーム時間超過');
            analysis.recommendations.push('処理の最適化');
        }
        
        if (current.memory > 500) {
            analysis.issues.push('高メモリ使用量');
            analysis.recommendations.push('メモリリークの確認');
        }
        
        return analysis;
    }
}

// パフォーマンステストの実行例
/*
const optimizer = new PerformanceOptimizer();
const monitor = new RealTimePerformanceMonitor();

// 包括的ベンチマーク実行
optimizer.runComprehensiveBenchmark().then(results => {
    console.log('ベンチマーク完了:', results);
});

// リアルタイム監視
setInterval(() => {
    const metrics = monitor.getCurrentMetrics();
    const analysis = monitor.getPerformanceAnalysis();
    console.log('パフォーマンス:', metrics, analysis);
}, 5000);
*/