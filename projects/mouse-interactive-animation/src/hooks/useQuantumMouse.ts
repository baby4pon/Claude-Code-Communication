import { useState, useEffect, useRef, useCallback } from 'react';

export interface Vector2D {
  x: number;
  y: number;
}

export interface QuantumState {
  position: Vector2D;
  probability: number;
  phase: number;
  resonance: number;
  waveFunction: Float32Array;
}

export interface QuantumMouseState {
  mousePosition: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  quantumStates: QuantumState[];
  resonanceLevel: number;
  isInitialized: boolean;
}

interface QuantumCalculationMessage {
  type: 'CALCULATE_QUANTUM_STATE' | 'QUANTUM_RESULT';
  payload: any;
}

export const useQuantumMouse = () => {
  const [state, setState] = useState<QuantumMouseState>({
    mousePosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    quantumStates: [],
    resonanceLevel: 0,
    isInitialized: false
  });

  const workerRef = useRef<Worker | null>(null);
  const previousPosition = useRef<Vector2D>({ x: 0, y: 0 });
  const previousVelocity = useRef<Vector2D>({ x: 0, y: 0 });
  const timestampRef = useRef<number>(0);
  const quantumHistory = useRef<QuantumState[]>([]);

  // Initialize Web Worker for quantum calculations
  useEffect(() => {
    // Create worker inline for demonstration
    const workerCode = `
      class QuantumCalculator {
        static calculateWaveFunction(position, velocity, acceleration) {
          const waveLength = 32;
          const waveFunction = new Float32Array(waveLength);
          
          for (let i = 0; i < waveLength; i++) {
            const phase = (i / waveLength) * 2 * Math.PI;
            const amplitude = Math.exp(-Math.pow(i - waveLength/2, 2) / (2 * Math.pow(waveLength/4, 2)));
            waveFunction[i] = amplitude * Math.sin(phase + velocity.x * 0.01 + velocity.y * 0.01);
          }
          
          return waveFunction;
        }
        
        static calculateResonance(quantumStates) {
          if (quantumStates.length === 0) return 0;
          
          let totalResonance = 0;
          for (let i = 0; i < quantumStates.length; i++) {
            for (let j = i + 1; j < quantumStates.length; j++) {
              const state1 = quantumStates[i];
              const state2 = quantumStates[j];
              
              const distance = Math.sqrt(
                Math.pow(state1.position.x - state2.position.x, 2) +
                Math.pow(state1.position.y - state2.position.y, 2)
              );
              
              const resonance = state1.probability * state2.probability * Math.exp(-distance / 100);
              totalResonance += resonance;
            }
          }
          
          return Math.min(totalResonance, 1.0);
        }
        
        static generateQuantumStates(mouseData, previousStates) {
          const { position, velocity, acceleration } = mouseData;
          const maxStates = 8;
          
          // Create new quantum state
          const newState = {
            position: { ...position },
            probability: Math.min(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) / 10, 1.0),
            phase: Math.atan2(velocity.y, velocity.x),
            resonance: 0,
            waveFunction: this.calculateWaveFunction(position, velocity, acceleration)
          };
          
          // Update existing states
          const updatedStates = previousStates.map(state => ({
            ...state,
            probability: state.probability * 0.98, // Decay
            phase: state.phase + 0.1 // Evolution
          })).filter(state => state.probability > 0.01);
          
          // Add new state
          updatedStates.push(newState);
          
          // Limit state count
          const finalStates = updatedStates.slice(-maxStates);
          
          // Calculate resonance
          const resonance = this.calculateResonance(finalStates);
          
          return { states: finalStates, resonance };
        }
      }
      
      self.onmessage = function(event) {
        const { type, payload } = event.data;
        
        if (type === 'CALCULATE_QUANTUM_STATE') {
          const result = QuantumCalculator.generateQuantumStates(
            payload.mouseData, 
            payload.previousStates
          );
          
          self.postMessage({
            type: 'QUANTUM_RESULT',
            payload: result
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (event: MessageEvent<QuantumCalculationMessage>) => {
      const { type, payload } = event.data;
      
      if (type === 'QUANTUM_RESULT') {
        setState(prevState => ({
          ...prevState,
          quantumStates: payload.states,
          resonanceLevel: payload.resonance,
          isInitialized: true
        }));
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Calculate physics from mouse movement
  const calculatePhysics = useCallback((newPosition: Vector2D, timestamp: number): void => {
    const deltaTime = timestamp - timestampRef.current;
    if (deltaTime === 0) return;

    // Calculate velocity
    const newVelocity = {
      x: (newPosition.x - previousPosition.current.x) / deltaTime * 1000,
      y: (newPosition.y - previousPosition.current.y) / deltaTime * 1000
    };

    // Calculate acceleration
    const newAcceleration = {
      x: (newVelocity.x - previousVelocity.current.x) / deltaTime * 1000,
      y: (newVelocity.y - previousVelocity.current.y) / deltaTime * 1000
    };

    // Update state
    setState(prevState => ({
      ...prevState,
      mousePosition: newPosition,
      velocity: newVelocity,
      acceleration: newAcceleration
    }));

    // Send to worker for quantum calculation
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'CALCULATE_QUANTUM_STATE',
        payload: {
          mouseData: {
            position: newPosition,
            velocity: newVelocity,
            acceleration: newAcceleration
          },
          previousStates: quantumHistory.current
        }
      });
    }

    // Update references
    previousPosition.current = newPosition;
    previousVelocity.current = newVelocity;
    timestampRef.current = timestamp;
  }, []);

  // Update quantum state from mouse event
  const updateQuantumState = useCallback((event: MouseEvent): void => {
    const newPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const timestamp = performance.now();
    calculatePhysics(newPosition, timestamp);
  }, [calculatePhysics]);

  // Get quantum field intensity at position
  const getQuantumIntensity = useCallback((position: Vector2D): number => {
    if (state.quantumStates.length === 0) return 0;

    let totalIntensity = 0;
    
    state.quantumStates.forEach(quantumState => {
      const distance = Math.sqrt(
        Math.pow(position.x - quantumState.position.x, 2) +
        Math.pow(position.y - quantumState.position.y, 2)
      );
      
      const influence = quantumState.probability * Math.exp(-distance / 50);
      totalIntensity += influence;
    });

    return Math.min(totalIntensity, 1.0);
  }, [state.quantumStates]);

  // Get dominant quantum phase at position  
  const getQuantumPhase = useCallback((position: Vector2D): number => {
    if (state.quantumStates.length === 0) return 0;

    let weightedPhase = 0;
    let totalWeight = 0;

    state.quantumStates.forEach(quantumState => {
      const distance = Math.sqrt(
        Math.pow(position.x - quantumState.position.x, 2) +
        Math.pow(position.y - quantumState.position.y, 2)
      );
      
      const weight = quantumState.probability * Math.exp(-distance / 100);
      weightedPhase += quantumState.phase * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedPhase / totalWeight : 0;
  }, [state.quantumStates]);

  return {
    ...state,
    updateQuantumState,
    getQuantumIntensity,
    getQuantumPhase
  };
};