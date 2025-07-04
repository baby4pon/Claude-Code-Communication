import React, { useState, useEffect, useRef, useCallback } from 'react';

// 🎆 Particle class for text animation
class Particle {
  constructor(x, y, char, context) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.char = char;
    this.vx = 0;
    this.vy = 0;
    this.life = 1;
    this.context = context;
    this.size = Math.random() * 4 + 8;
    this.color = this.getRandomColor();
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 2 + 1;
    this.friction = 0.98;
    this.gravity = 0.1;
    this.phase = 'forming'; // forming, stable, exploding, regenerating
    this.timer = 0;
    this.maxLife = 300;
  }

  getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.timer++;
    
    switch (this.phase) {
      case 'forming':
        // Particles move towards their target position
        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;
        this.vx += dx * 0.1;
        this.vy += dy * 0.1;
        
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
          this.phase = 'stable';
          this.timer = 0;
        }
        break;
        
      case 'stable':
        // Gentle floating animation
        this.x += Math.sin(this.timer * 0.02 + this.angle) * 0.5;
        this.y += Math.cos(this.timer * 0.03 + this.angle) * 0.3;
        
        // Transition to explosion after 120 frames
        if (this.timer > 120) {
          this.phase = 'exploding';
          this.timer = 0;
          this.vx = (Math.random() - 0.5) * 15;
          this.vy = (Math.random() - 0.5) * 15;
        }
        break;
        
      case 'exploding':
        // Explosive movement
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.life -= 0.02;
        
        // Start regeneration
        if (this.life <= 0.1) {
          this.phase = 'regenerating';
          this.timer = 0;
          this.life = 0.1;
        }
        break;
        
      case 'regenerating':
        // Regenerate back to original position
        this.life += 0.03;
        if (this.life >= 1) {
          this.life = 1;
          this.phase = 'forming';
          this.timer = 0;
          // Reset to random position for dramatic effect
          this.x = this.originalX + (Math.random() - 0.5) * 200;
          this.y = this.originalY + (Math.random() - 0.5) * 200;
        }
        break;
    }
    
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    this.context.save();
    this.context.globalAlpha = this.life;
    
    // Glow effect
    this.context.shadowColor = this.color;
    this.context.shadowBlur = 20;
    
    // Draw particle
    this.context.fillStyle = this.color;
    this.context.font = `${this.size}px Arial`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    
    // Add rotation during explosion
    if (this.phase === 'exploding') {
      this.context.translate(this.x, this.y);
      this.context.rotate(this.timer * 0.1);
      this.context.fillText(this.char, 0, 0);
    } else {
      this.context.fillText(this.char, this.x, this.y);
    }
    
    this.context.restore();
  }
}

// 🎨 Main ParticleTextAnimation Component
const ParticleTextAnimation = () => {
  const canvasRef = useRef(null);
  const [text, setText] = useState('MAGIC');
  const [particles, setParticles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const contextRef = useRef(null);

  // 🎯 Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    contextRef.current = canvas.getContext('2d');

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔄 Generate particles from text
  const generateParticles = useCallback((inputText) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return [];

    const newParticles = [];
    const fontSize = Math.min(canvas.width / inputText.length * 0.8, 100);
    
    context.font = `${fontSize}px Arial`;
    const textWidth = context.measureText(inputText).width;
    const startX = (canvas.width - textWidth) / 2;
    const startY = canvas.height / 2;

    let currentX = startX;
    
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      if (char === ' ') {
        currentX += fontSize * 0.5;
        continue;
      }

      const charWidth = context.measureText(char).width;
      
      // Create multiple particles per character for richer effect
      for (let j = 0; j < 3; j++) {
        const particle = new Particle(
          currentX + charWidth / 2 + (Math.random() - 0.5) * 20,
          startY + (Math.random() - 0.5) * 20,
          char,
          context
        );
        newParticles.push(particle);
      }
      
      currentX += charWidth + 10;
    }

    return newParticles;
  }, []);

  // 🎬 Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas with fade effect
    context.fillStyle = 'rgba(10, 10, 10, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [particles]);

  // 🚀 Start animation
  useEffect(() => {
    if (isAnimating && particles.length > 0) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, particles, animate]);

  // 🎭 Handle text change
  const handleTextChange = (newText) => {
    setText(newText);
    if (newText.trim()) {
      const newParticles = generateParticles(newText.toUpperCase());
      setParticles(newParticles);
      setIsAnimating(true);
    } else {
      setParticles([]);
      setIsAnimating(false);
    }
  };

  // 🎪 Preset animations
  const presetTexts = ['MAGIC', 'DREAM', 'FUTURE', 'WONDER', 'INSPIRE'];
  
  const triggerPreset = (presetText) => {
    handleTextChange(presetText);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 🎨 Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'linear-gradient(45deg, #0a0a0a, #1a1a2e, #16213e)',
          cursor: 'pointer'
        }}
        onClick={() => {
          // Click to regenerate with random preset
          const randomPreset = presetTexts[Math.floor(Math.random() * presetTexts.length)];
          triggerPreset(randomPreset);
        }}
      />

      {/* 🎛️ Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center'
      }}>
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your magical text..."
          style={{
            padding: '15px 25px',
            fontSize: '18px',
            border: '2px solid #4ECDC4',
            borderRadius: '50px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            textAlign: 'center',
            width: '300px',
            outline: 'none',
            marginBottom: '15px'
          }}
        />
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {presetTexts.map((preset, index) => (
            <button
              key={index}
              onClick={() => triggerPreset(preset)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: '1px solid #FF6B6B',
                borderRadius: '25px',
                background: 'rgba(255, 107, 107, 0.2)',
                color: '#FF6B6B',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#FF6B6B';
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 107, 107, 0.2)';
                e.target.style.color = '#FF6B6B';
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 🎪 Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        textAlign: 'center',
        fontSize: '14px',
        opacity: 0.7
      }}>
        ✨ Click anywhere to generate random text • Type your own magical words above ✨
      </div>
    </div>
  );
};

export default ParticleTextAnimation;