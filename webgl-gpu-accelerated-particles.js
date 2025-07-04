// WebGL2 + GPU並列処理実装
class WebGLParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');
        
        if (!this.gl) {
            throw new Error('WebGL2 not supported');
        }
        
        this.maxParticles = 10000;
        this.activeParticles = 0;
        this.time = 0;
        
        // バッファとテクスチャ
        this.positionBuffer = null;
        this.velocityBuffer = null;
        this.colorBuffer = null;
        this.lifeBuffer = null;
        this.vertexBuffer = null;
        
        // シェーダープログラム
        this.computeProgram = null;
        this.renderProgram = null;
        
        // Transform Feedback
        this.transformFeedback = null;
        
        this.initializeWebGL();
        this.initializeBuffers();
        this.initializeShaders();
        this.setupTransformFeedback();
        
        this.animate();
    }
    
    initializeWebGL() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    
    initializeBuffers() {
        // パーティクル位置データ
        const positions = new Float32Array(this.maxParticles * 3);
        // パーティクル速度データ
        const velocities = new Float32Array(this.maxParticles * 3);
        // パーティクル色データ
        const colors = new Float32Array(this.maxParticles * 4);
        // パーティクル寿命データ
        const lives = new Float32Array(this.maxParticles * 2); // [life, maxLife]
        
        // 初期データ設定
        for (let i = 0; i < this.maxParticles; i++) {
            const i3 = i * 3;
            const i4 = i * 4;
            const i2 = i * 2;
            
            // 位置: 画面中央に配置
            positions[i3] = (Math.random() - 0.5) * 0.1;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.1;
            positions[i3 + 2] = 0.0;
            
            // 速度: ランダムな方向
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.02;
            velocities[i3] = Math.cos(angle) * speed;
            velocities[i3 + 1] = Math.sin(angle) * speed;
            velocities[i3 + 2] = 0.0;
            
            // 色: ランダムな色
            colors[i4] = Math.random();
            colors[i4 + 1] = Math.random();
            colors[i4 + 2] = Math.random();
            colors[i4 + 3] = 1.0;
            
            // 寿命
            lives[i2] = Math.random() * 5.0 + 1.0; // 現在の寿命
            lives[i2 + 1] = lives[i2]; // 最大寿命
        }
        
        // VBO作成
        this.positionBuffer = this.createBuffer(positions, this.gl.DYNAMIC_DRAW);
        this.velocityBuffer = this.createBuffer(velocities, this.gl.DYNAMIC_DRAW);
        this.colorBuffer = this.createBuffer(colors, this.gl.DYNAMIC_DRAW);
        this.lifeBuffer = this.createBuffer(lives, this.gl.DYNAMIC_DRAW);
        
        // 頂点データ（四角形）
        const vertices = new Float32Array([
            -0.005, -0.005, 0.0,
             0.005, -0.005, 0.0,
            -0.005,  0.005, 0.0,
             0.005,  0.005, 0.0
        ]);
        
        this.vertexBuffer = this.createBuffer(vertices, this.gl.STATIC_DRAW);
        
        this.activeParticles = this.maxParticles;
    }
    
    createBuffer(data, usage) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
        return buffer;
    }
    
    initializeShaders() {
        // 計算シェーダー（Transform Feedback用）
        const computeVertexShader = `#version 300 es
        precision highp float;
        
        layout(location = 0) in vec3 a_position;
        layout(location = 1) in vec3 a_velocity;
        layout(location = 2) in vec4 a_color;
        layout(location = 3) in vec2 a_life;
        
        uniform float u_time;
        uniform float u_deltaTime;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        
        out vec3 v_position;
        out vec3 v_velocity;
        out vec4 v_color;
        out vec2 v_life;
        
        // 量子波動関数
        float quantumWave(vec2 pos, float time) {
            return sin(pos.x * 10.0 + time) * cos(pos.y * 10.0 + time) * 0.01;
        }
        
        // フラクタルノイズ
        float fractalNoise(vec2 pos) {
            float n = 0.0;
            float amplitude = 1.0;
            float frequency = 1.0;
            
            for (int i = 0; i < 4; i++) {
                n += sin(pos.x * frequency) * cos(pos.y * frequency) * amplitude;
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            
            return n * 0.1;
        }
        
        void main() {
            vec3 position = a_position;
            vec3 velocity = a_velocity;
            vec4 color = a_color;
            vec2 life = a_life;
            
            // 寿命管理
            life.x -= u_deltaTime;
            
            if (life.x > 0.0) {
                // 量子効果
                vec2 quantumForce = vec2(
                    quantumWave(position.xy + vec2(0.1, 0.0), u_time),
                    quantumWave(position.xy + vec2(0.0, 0.1), u_time)
                );
                
                // フラクタルノイズによる擾乱
                vec2 fractalForce = vec2(
                    fractalNoise(position.xy * 5.0 + u_time),
                    fractalNoise(position.xy * 5.0 + u_time + 100.0)
                );
                
                // 流体力学的な力
                vec2 fluidForce = vec2(0.0);
                
                // マウス引力
                vec2 mousePos = (u_mouse / u_resolution) * 2.0 - 1.0;
                vec2 mouseDir = mousePos - position.xy;
                float mouseDist = length(mouseDir);
                if (mouseDist > 0.0) {
                    fluidForce += normalize(mouseDir) * 0.001 / (mouseDist + 0.1);
                }
                
                // 重力
                vec2 gravity = vec2(0.0, -0.0005);
                
                // 力の合成
                vec2 totalForce = quantumForce + fractalForce + fluidForce + gravity;
                
                // 速度と位置の更新
                velocity.xy += totalForce * u_deltaTime;
                velocity.xy *= 0.99; // ダンピング
                position.xy += velocity.xy * u_deltaTime;
                
                // 境界条件
                if (position.x < -1.0) { position.x = -1.0; velocity.x = abs(velocity.x); }
                if (position.x > 1.0) { position.x = 1.0; velocity.x = -abs(velocity.x); }
                if (position.y < -1.0) { position.y = -1.0; velocity.y = abs(velocity.y); }
                if (position.y > 1.0) { position.y = 1.0; velocity.y = -abs(velocity.y); }
                
                // 色の変化
                float lifeRatio = life.x / life.y;
                color.a = lifeRatio;
                color.rgb = mix(color.rgb, vec3(1.0, 0.0, 0.0), 1.0 - lifeRatio);
                
            } else {
                // パーティクルを再生成
                position.xy = (vec2(sin(u_time * 0.5), cos(u_time * 0.3)) + 
                              vec2(sin(u_time * 1.2), cos(u_time * 0.8)) * 0.5) * 0.1;
                velocity.xy = vec2(sin(u_time * 3.0), cos(u_time * 2.0)) * 0.02;
                life.x = life.y;
                color.a = 1.0;
                color.rgb = vec3(
                    sin(u_time + position.x * 10.0) * 0.5 + 0.5,
                    cos(u_time + position.y * 10.0) * 0.5 + 0.5,
                    sin(u_time * 0.7) * 0.5 + 0.5
                );
            }
            
            v_position = position;
            v_velocity = velocity;
            v_color = color;
            v_life = life;
        }`;
        
        const computeFragmentShader = `#version 300 es
        precision highp float;
        
        void main() {
            // Transform Feedbackでは何もしない
        }`;
        
        // 描画用シェーダー
        const renderVertexShader = `#version 300 es
        precision highp float;
        
        layout(location = 0) in vec3 a_vertex;
        layout(location = 1) in vec3 a_position;
        layout(location = 2) in vec4 a_color;
        layout(location = 3) in vec2 a_life;
        
        uniform float u_time;
        
        out vec4 v_color;
        out vec2 v_texCoord;
        
        void main() {
            float lifeRatio = a_life.x / a_life.y;
            float size = 0.01 * lifeRatio;
            
            vec3 position = a_vertex * size + a_position;
            gl_Position = vec4(position, 1.0);
            
            v_color = a_color;
            v_texCoord = a_vertex.xy;
        }`;
        
        const renderFragmentShader = `#version 300 es
        precision highp float;
        
        in vec4 v_color;
        in vec2 v_texCoord;
        
        out vec4 fragColor;
        
        void main() {
            // 円形パーティクル
            float dist = length(v_texCoord);
            float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
            
            // 光る効果
            float glow = exp(-dist * 3.0);
            
            vec3 color = v_color.rgb + vec3(glow * 0.5);
            fragColor = vec4(color, v_color.a * alpha);
        }`;
        
        // シェーダーコンパイル
        this.computeProgram = this.createProgram(computeVertexShader, computeFragmentShader, 
            ['v_position', 'v_velocity', 'v_color', 'v_life']);
        this.renderProgram = this.createProgram(renderVertexShader, renderFragmentShader);
    }
    
    createShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexSource, fragmentSource, transformFeedbackVaryings = null) {
        const vertexShader = this.createShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.createShader(fragmentSource, this.gl.FRAGMENT_SHADER);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        
        if (transformFeedbackVaryings) {
            this.gl.transformFeedbackVaryings(program, transformFeedbackVaryings, this.gl.INTERLEAVED_ATTRIBS);
        }
        
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    setupTransformFeedback() {
        this.transformFeedback = this.gl.createTransformFeedback();
        
        // 出力バッファ
        const outputSize = this.maxParticles * (3 + 3 + 4 + 2) * 4; // (pos + vel + color + life) * 4 bytes
        this.outputBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.outputBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, outputSize, this.gl.DYNAMIC_DRAW);
        
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.outputBuffer);
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // Transform Feedback を使用してパーティクルを更新
        this.gl.useProgram(this.computeProgram);
        
        // Uniform設定
        this.gl.uniform1f(this.gl.getUniformLocation(this.computeProgram, 'u_time'), this.time);
        this.gl.uniform1f(this.gl.getUniformLocation(this.computeProgram, 'u_deltaTime'), deltaTime);
        this.gl.uniform2f(this.gl.getUniformLocation(this.computeProgram, 'u_resolution'), 
            this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.gl.getUniformLocation(this.computeProgram, 'u_mouse'), 
            this.mouseX || 0, this.mouseY || 0);
        
        // 入力属性設定
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.velocityBuffer);
        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.enableVertexAttribArray(2);
        this.gl.vertexAttribPointer(2, 4, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lifeBuffer);
        this.gl.enableVertexAttribArray(3);
        this.gl.vertexAttribPointer(3, 2, this.gl.FLOAT, false, 0, 0);
        
        // Transform Feedback実行
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        this.gl.enable(this.gl.RASTERIZER_DISCARD);
        this.gl.beginTransformFeedback(this.gl.POINTS);
        
        this.gl.drawArrays(this.gl.POINTS, 0, this.activeParticles);
        
        this.gl.endTransformFeedback();
        this.gl.disable(this.gl.RASTERIZER_DISCARD);
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);
        
        // バッファをスワップ（更新されたデータを次フレームで使用）
        this.swapBuffers();
    }
    
    swapBuffers() {
        // 出力バッファから更新されたデータを読み取り、入力バッファに設定
        // 実際の実装では、バッファのポインタを交換する方が効率的
        const stride = (3 + 3 + 4 + 2) * 4; // bytes per particle
        
        // 簡単な実装: データをコピー
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.outputBuffer);
        
        // 位置データをコピー
        this.gl.bindBuffer(this.gl.COPY_WRITE_BUFFER, this.positionBuffer);
        for (let i = 0; i < this.activeParticles; i++) {
            this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.COPY_WRITE_BUFFER,
                i * stride, i * 3 * 4, 3 * 4);
        }
        
        // 実際の実装では、より効率的なバッファスワップを使用
    }
    
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.useProgram(this.renderProgram);
        
        // Uniform設定
        this.gl.uniform1f(this.gl.getUniformLocation(this.renderProgram, 'u_time'), this.time);
        
        // 頂点データ設定
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        
        // インスタンスデータ設定
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(1, 1);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.enableVertexAttribArray(2);
        this.gl.vertexAttribPointer(2, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(2, 1);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lifeBuffer);
        this.gl.enableVertexAttribArray(3);
        this.gl.vertexAttribPointer(3, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(3, 1);
        
        // インスタンス描画
        this.gl.drawArraysInstanced(this.gl.TRIANGLE_STRIP, 0, 4, this.activeParticles);
        
        // クリーンアップ
        this.gl.vertexAttribDivisor(1, 0);
        this.gl.vertexAttribDivisor(2, 0);
        this.gl.vertexAttribDivisor(3, 0);
    }
    
    animate() {
        const currentTime = performance.now() * 0.001;
        const deltaTime = Math.min(currentTime - (this.lastTime || 0), 0.016);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    // マウスイベント
    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
    
    // パーティクル数の動的調整
    setParticleCount(count) {
        this.activeParticles = Math.min(count, this.maxParticles);
    }
}

// 使用例
/*
const canvas = document.getElementById('webgl-canvas');
const system = new WebGLParticleSystem(canvas);

// マウス追跡
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    system.setMousePosition(x, y);
});

// パーティクル数制御
document.getElementById('particle-count').addEventListener('input', (e) => {
    system.setParticleCount(parseInt(e.target.value));
});
*/