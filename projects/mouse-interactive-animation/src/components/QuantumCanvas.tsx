import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Vector2D, QuantumState } from '../hooks/useQuantumMouse';

interface QuantumCanvasProps {
  mode: 'quantum' | 'temporal' | 'emotion' | 'distortion';
  intensity: number;
  showTrail: boolean;
  particleCount: number;
  mousePosition: Vector2D;
  quantumStates: QuantumState[];
  resonanceLevel: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const QuantumCanvas = forwardRef<HTMLCanvasElement, QuantumCanvasProps>(
  ({ mode, intensity, showTrail, particleCount, mousePosition, quantumStates, resonanceLevel }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationIdRef = useRef<number>();
    const trailPointsRef = useRef<Vector2D[]>([]);

    useImperativeHandle(ref, () => canvasRef.current!, []);

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      contextRef.current = context;

      // Set canvas size
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }, []);

    // Initialize particles
    useEffect(() => {
      particlesRef.current = Array.from({ length: particleCount }, () => createParticle());
    }, [particleCount]);

    // Create a new particle
    const createParticle = (): Particle => {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100,
        maxLife: 100,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        size: Math.random() * 3 + 1
      };
    };

    // Update particles based on quantum states
    const updateParticles = () => {
      particlesRef.current.forEach(particle => {
        // Apply quantum influence
        quantumStates.forEach(state => {
          const dx = particle.x - state.position.x;
          const dy = particle.y - state.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            const force = (state.probability * intensity) / (distance + 1);
            const angle = state.phase + Math.atan2(dy, dx);
            
            particle.vx += Math.cos(angle) * force * 0.1;
            particle.vy += Math.sin(angle) * force * 0.1;
          }
        });

        // Apply mouse attraction
        const mouseDx = mousePosition.x - particle.x;
        const mouseDy = mousePosition.y - particle.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        
        if (mouseDistance < 150) {
          const mouseForce = (intensity * 0.5) / (mouseDistance + 1);
          particle.vx += (mouseDx / mouseDistance) * mouseForce;
          particle.vy += (mouseDy / mouseDistance) * mouseForce;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Apply friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update life
        particle.life -= 0.5;
        if (particle.life <= 0) {
          Object.assign(particle, createParticle());
        }

        // Boundary wrapping
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.y < 0) particle.y = window.innerHeight;
        if (particle.y > window.innerHeight) particle.y = 0;
      });
    };

    // Update trail points
    const updateTrail = () => {
      if (showTrail) {
        trailPointsRef.current.push({ ...mousePosition });
        if (trailPointsRef.current.length > 50) {
          trailPointsRef.current.shift();
        }
      } else {
        trailPointsRef.current = [];
      }
    };

    // Render quantum effects
    const renderQuantumEffects = (context: CanvasRenderingContext2D) => {
      quantumStates.forEach((state, index) => {
        const alpha = state.probability * intensity;
        
        // Quantum field visualization
        context.save();
        context.globalAlpha = alpha * 0.3;
        
        const gradient = context.createRadialGradient(
          state.position.x, state.position.y, 0,
          state.position.x, state.position.y, 100
        );
        
        const hue = (state.phase * 180 / Math.PI + 180) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);
        
        context.fillStyle = gradient;
        context.fillRect(
          state.position.x - 100, state.position.y - 100,
          200, 200
        );
        
        context.restore();

        // Quantum core
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = `hsl(${hue}, 80%, 60%)`;
        context.beginPath();
        context.arc(state.position.x, state.position.y, state.probability * 10, 0, Math.PI * 2);
        context.fill();
        context.restore();

        // Wave function visualization
        if (state.waveFunction && state.waveFunction.length > 0) {
          context.save();
          context.globalAlpha = alpha * 0.5;
          context.strokeStyle = `hsl(${hue + 60}, 60%, 40%)`;
          context.lineWidth = 2;
          context.beginPath();
          
          for (let i = 0; i < state.waveFunction.length; i++) {
            const angle = (i / state.waveFunction.length) * Math.PI * 2;
            const radius = 20 + state.waveFunction[i] * 10;
            const x = state.position.x + Math.cos(angle) * radius;
            const y = state.position.y + Math.sin(angle) * radius;
            
            if (i === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          }
          
          context.closePath();
          context.stroke();
          context.restore();
        }
      });
    };

    // Render particles
    const renderParticles = (context: CanvasRenderingContext2D) => {
      particlesRef.current.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        
        context.save();
        context.globalAlpha = alpha * intensity;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });
    };

    // Render trail
    const renderTrail = (context: CanvasRenderingContext2D) => {
      if (trailPointsRef.current.length < 2) return;

      context.save();
      context.strokeStyle = `hsla(${resonanceLevel * 360}, 80%, 60%, 0.8)`;
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      context.beginPath();
      trailPointsRef.current.forEach((point, index) => {
        const alpha = index / trailPointsRef.current.length;
        context.globalAlpha = alpha * intensity;
        
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      
      context.stroke();
      context.restore();
    };

    // Render mode-specific effects
    const renderModeEffects = (context: CanvasRenderingContext2D) => {
      switch (mode) {
        case 'temporal':
          // Temporal distortion effects
          context.save();
          context.globalAlpha = resonanceLevel * 0.3;
          context.fillStyle = 'rgba(100, 200, 255, 0.1)';
          context.fillRect(0, 0, context.canvas.width, context.canvas.height);
          context.restore();
          break;
          
        case 'emotion':
          // Emotion-based color shifts
          const emotionHue = (resonanceLevel * 360) % 360;
          context.save();
          context.globalCompositeOperation = 'multiply';
          context.fillStyle = `hsla(${emotionHue}, 50%, 50%, 0.05)`;
          context.fillRect(0, 0, context.canvas.width, context.canvas.height);
          context.restore();
          break;
          
        case 'distortion':
          // Reality distortion effects
          context.save();
          context.filter = `blur(${resonanceLevel * 2}px)`;
          context.globalCompositeOperation = 'overlay';
          context.fillStyle = 'rgba(255, 255, 255, 0.02)';
          context.fillRect(0, 0, context.canvas.width, context.canvas.height);
          context.restore();
          break;
      }
    };

    // Main animation loop
    const animate = () => {
      const context = contextRef.current;
      if (!context) return;

      // Clear canvas with fade effect
      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);

      // Update and render
      updateParticles();
      updateTrail();
      
      renderQuantumEffects(context);
      renderParticles(context);
      renderTrail(context);
      renderModeEffects(context);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    useEffect(() => {
      animate();
      
      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    }, [mode, intensity, showTrail, mousePosition, quantumStates, resonanceLevel]);

    return (
      <canvas
        ref={canvasRef}
        className="quantum-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    );
  }
);