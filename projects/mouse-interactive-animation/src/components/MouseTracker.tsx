import React, { useEffect } from 'react';

interface MouseTrackerProps {
  onMouseUpdate: (event: MouseEvent) => void;
}

export const MouseTracker: React.FC<MouseTrackerProps> = ({ onMouseUpdate }) => {
  useEffect(() => {
    let animationFrameId: number;
    let lastEvent: MouseEvent | null = null;

    // Throttled mouse update using RAF
    const handleMouseMove = (event: MouseEvent) => {
      lastEvent = event;
      
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          if (lastEvent) {
            onMouseUpdate(lastEvent);
          }
          animationFrameId = 0;
        });
      }
    };

    // Touch events for mobile support
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) {
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true
        });
        handleMouseMove(mouseEvent);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Initialize with center position
    const initialEvent = new MouseEvent('mousemove', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
      bubbles: true,
      cancelable: true
    });
    onMouseUpdate(initialEvent);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onMouseUpdate]);

  return null; // This component doesn't render anything
};