import React from 'react';

interface FogOverlayProps {
  /** Whether fog is active */
  isActive: boolean;
}

/**
 * Fog overlay component
 * Can be used over any game board for fog powerup effect
 */
export const FogOverlay: React.FC<FogOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Multiple fog layers for depth effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/40 to-gray-600/40 animate-pulse" />
      <div
        className="absolute inset-0 bg-gradient-to-tl from-gray-500/30 to-gray-400/30"
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-500/20"
        style={{ animationDelay: '1s' }}
      />

      {/* Fog icon indicator */}
      <div className="absolute top-2 right-2 text-4xl opacity-70 animate-pulse">
        🌫️
      </div>
    </div>
  );
};

FogOverlay.displayName = 'FogOverlay';
