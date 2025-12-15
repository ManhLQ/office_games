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
      {/* Multiple fog layers for depth effect - OPAQUE to block vision */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/90 to-gray-700/85 animate-pulse backdrop-blur-md" />
      <div
        className="absolute inset-0 bg-gradient-to-tl from-gray-600/80 to-gray-500/75 backdrop-blur-sm"
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-700/70 to-gray-600/70"
        style={{ animationDelay: '1s' }}
      />

      {/* Fog icon indicator */}
      <div className="absolute top-2 right-2 text-4xl opacity-90 animate-pulse">
        🌫️
      </div>
    </div>
  );
};

FogOverlay.displayName = 'FogOverlay';
