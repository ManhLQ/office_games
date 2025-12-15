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

      {/* Cloud pattern covering entire panel using CSS */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'60\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E🌫️%3C/text%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px'
        }}
      />

      {/* Fog icon indicator */}
      <div className="absolute top-2 right-2 text-4xl opacity-90 animate-pulse">
        🌫️
      </div>
    </div>
  );
};

FogOverlay.displayName = 'FogOverlay';
