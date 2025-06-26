// Temporal Color Symphony - 時間連動カラー交響曲システム
class TemporalColorSystem {
    constructor() {
        this.startTime = Date.now();
        this.mouseHistory = [];
        this.colorMemory = [];
        this.maxHistoryLength = 1800; // 30秒 * 60fps
        this.maxMemoryLength = 300;
        
        // カラーパラメータ
        this.colorParams = {
            timeHueShift: 360 / (24 * 60 * 60 * 1000), // 24時間で1周
            complexityInfluence: 0.5,
            memoryDecay: 0.95,
            brightnessRange: { min: 40, max: 80 },
            saturationRange: { min: 60, max: 95 }
        };
        
        // 時間帯による基本カラーテーマ
        this.timeThemes = {
            dawn: { hue: 30, sat: 80, light: 70 },     // 暖かいオレンジ
            morning: { hue: 60, sat: 75, light: 65 },  // 爽やかな黄色
            noon: { hue: 200, sat: 70, light: 60 },    // 明るい青
            afternoon: { hue: 45, sat: 85, light: 65 }, // 温かい黄金
            evening: { hue: 15, sat: 90, light: 55 },  // 夕日のオレンジ
            night: { hue: 240, sat: 80, light: 45 },   // 深い青紫
            midnight: { hue: 270, sat: 70, light: 35 } // 神秘的な紫
        };
        
        console.log('Temporal Color System initialized');
    }
    
    getCurrentColor(mouse) {
        // マウス履歴の更新
        this.updateMouseHistory(mouse);
        
        // 現在時刻の取得
        const now = new Date();
        const currentTime = {
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds(),
            millisecond: now.getMilliseconds()
        };
        
        // 基本色の計算
        const baseColor = this.calculateTimeBasedColor(currentTime);
        
        // 複雑度の計算
        const complexity = this.calculateMovementComplexity();
        
        // メモリ効果の適用
        const memoryInfluence = this.getColorMemoryInfluence();
        
        // 最終色の合成
        const finalColor = this.synthesizeColor(baseColor, complexity, memoryInfluence);
        
        // カラーメモリの更新
        this.updateColorMemory(finalColor);
        
        return this.formatColor(finalColor);
    }
    
    updateMouseHistory(mouse) {
        const historyEntry = {
            x: mouse.x,
            y: mouse.y,
            velocity: mouse.velocity || 0,
            timestamp: Date.now()
        };
        
        this.mouseHistory.push(historyEntry);
        
        // 履歴の長さ制限
        if (this.mouseHistory.length > this.maxHistoryLength) {
            this.mouseHistory.shift();
        }
    }
    
    calculateTimeBasedColor(currentTime) {
        const timeOfDay = this.getTimeOfDay(currentTime.hour);
        const baseTheme = this.timeThemes[timeOfDay];
        
        // 時間内での微細な変化
        const minuteProgress = (currentTime.minute + currentTime.second / 60) / 60;
        const microHueShift = Math.sin(minuteProgress * Math.PI * 4) * 15;
        
        return {
            h: (baseTheme.hue + microHueShift + 360) % 360,
            s: baseTheme.sat + Math.sin(Date.now() * 0.001) * 10,
            l: baseTheme.light + Math.cos(Date.now() * 0.0015) * 8
        };
    }
    
    getTimeOfDay(hour) {
        if (hour >= 5 && hour < 7) return 'dawn';
        if (hour >= 7 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 14) return 'noon';
        if (hour >= 14 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'evening';
        if (hour >= 20 && hour < 23) return 'night';
        return 'midnight';
    }
    
    calculateMovementComplexity() {
        if (this.mouseHistory.length < 10) return 0;
        
        const recentHistory = this.mouseHistory.slice(-180); // 過去3秒
        let totalAngleChange = 0;
        let totalVelocityVariation = 0;
        let avgVelocity = 0;
        
        for (let i = 2; i < recentHistory.length; i++) {
            const prev = recentHistory[i - 1];
            const curr = recentHistory[i];
            const next = recentHistory[i + 1] || curr;
            
            // 角度変化の計算
            const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
            const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
            let angleDiff = Math.abs(angle2 - angle1);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            totalAngleChange += angleDiff;
            
            // 速度変化の計算
            if (i > 0) {
                totalVelocityVariation += Math.abs(curr.velocity - prev.velocity);
            }
            avgVelocity += curr.velocity;
        }
        
        const complexity = {
            angularComplexity: totalAngleChange / recentHistory.length,
            velocityComplexity: totalVelocityVariation / recentHistory.length,
            averageVelocity: avgVelocity / recentHistory.length
        };
        
        // 正規化された複雑度 (0-1)
        return Math.min(1, (complexity.angularComplexity * 0.5 + 
                          complexity.velocityComplexity * 0.01 + 
                          complexity.averageVelocity * 0.005));
    }
    
    getColorMemoryInfluence() {
        if (this.colorMemory.length === 0) return { h: 0, s: 0, l: 0 };
        
        let avgHue = 0;
        let avgSat = 0;
        let avgLight = 0;
        let totalWeight = 0;
        
        this.colorMemory.forEach((color, index) => {
            const weight = Math.pow(this.colorParams.memoryDecay, this.colorMemory.length - index - 1);
            avgHue += color.h * weight;
            avgSat += color.s * weight;
            avgLight += color.l * weight;
            totalWeight += weight;
        });
        
        if (totalWeight > 0) {
            return {
                h: avgHue / totalWeight,
                s: avgSat / totalWeight,
                l: avgLight / totalWeight
            };
        }
        
        return { h: 0, s: 0, l: 0 };
    }
    
    synthesizeColor(baseColor, complexity, memoryInfluence) {
        // 複雑度による色相の調整
        const complexityHueShift = complexity * 60 - 30; // -30 to +30
        
        // メモリ影響の適用（重み付き平均）
        const memoryWeight = 0.3;
        const baseWeight = 0.7;
        
        let finalHue = (baseColor.h * baseWeight + memoryInfluence.h * memoryWeight + complexityHueShift) % 360;
        if (finalHue < 0) finalHue += 360;
        
        // 彩度の調整（複雑度が高いほど鮮やか）
        const finalSat = Math.max(this.colorParams.saturationRange.min, 
                                Math.min(this.colorParams.saturationRange.max,
                                       baseColor.s + complexity * 20));
        
        // 明度の調整（動きがあるほど明るく）
        const finalLight = Math.max(this.colorParams.brightnessRange.min,
                                  Math.min(this.colorParams.brightnessRange.max,
                                         baseColor.l + complexity * 15));
        
        return {
            h: Math.round(finalHue),
            s: Math.round(finalSat),
            l: Math.round(finalLight)
        };
    }
    
    updateColorMemory(color) {
        this.colorMemory.push({
            h: color.h,
            s: color.s,
            l: color.l,
            timestamp: Date.now()
        });
        
        // メモリの長さ制限
        if (this.colorMemory.length > this.maxMemoryLength) {
            this.colorMemory.shift();
        }
    }
    
    formatColor(color) {
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }
    
    // 特別なカラーエフェクト
    getHarmoniousColor(baseColor, offset = 120) {
        return {
            h: (baseColor.h + offset) % 360,
            s: baseColor.s,
            l: baseColor.l
        };
    }
    
    getComplementaryColor(baseColor) {
        return this.getHarmoniousColor(baseColor, 180);
    }
    
    getTriadicColors(baseColor) {
        return [
            baseColor,
            this.getHarmoniousColor(baseColor, 120),
            this.getHarmoniousColor(baseColor, 240)
        ];
    }
    
    // 時間に基づく特殊エフェクト
    getMagicHourEffect() {
        const now = new Date();
        const hour = now.getHours();
        
        // マジックアワー（朝5-7時、夕17-19時）の特別な効果
        if ((hour >= 5 && hour < 7) || (hour >= 17 && hour < 19)) {
            const intensity = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;
            return {
                isActive: true,
                intensity: intensity,
                colors: this.getTriadicColors({
                    h: hour < 12 ? 30 : 15, // 朝は黄金、夕は橙
                    s: 90,
                    l: 60 + intensity * 20
                })
            };
        }
        
        return { isActive: false };
    }
    
    update(timestamp) {
        // 古い履歴の清理
        const cutoffTime = timestamp - 30000; // 30秒前
        this.mouseHistory = this.mouseHistory.filter(entry => entry.timestamp > cutoffTime);
        this.colorMemory = this.colorMemory.filter(entry => entry.timestamp > cutoffTime);
    }
    
    // システム統計
    getStats() {
        return {
            historyLength: this.mouseHistory.length,
            memoryLength: this.colorMemory.length,
            complexity: this.calculateMovementComplexity(),
            currentTimeTheme: this.getTimeOfDay(new Date().getHours()),
            uptime: Date.now() - this.startTime
        };
    }
    
    // カラーパレット生成
    generatePalette(baseColor, count = 5) {
        const palette = [];
        const step = 360 / count;
        
        for (let i = 0; i < count; i++) {
            palette.push({
                h: (baseColor.h + step * i) % 360,
                s: baseColor.s + (Math.random() - 0.5) * 20,
                l: baseColor.l + (Math.random() - 0.5) * 30
            });
        }
        
        return palette.map(color => this.formatColor(color));
    }
}