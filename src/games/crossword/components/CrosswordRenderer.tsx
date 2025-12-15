import React from 'react';
import type { IGameRenderer } from '../../core/interfaces/IGameRenderer';
import type { PlayerBoardProps, MiniBoardProps, ControlsProps } from '../../core/interfaces/IGameRenderer';

/**
 * Crossword game renderer
 * TODO: Implement full rendering
 */
export class CrosswordRenderer implements IGameRenderer {
  renderPlayerBoard(_props: PlayerBoardProps): React.ReactElement {
    return React.createElement('div', { className: 'crossword-board' },
      'Crossword Board - Coming Soon'
    );
  }

  renderMiniBoard(_props: MiniBoardProps): React.ReactElement {
    return React.createElement('div', { className: 'crossword-mini-board' },
      'Mini Board'
    );
  }

  renderControls(_props: ControlsProps): React.ReactElement {
    return React.createElement('div', { className: 'crossword-controls' },
      'Controls'
    );
  }
}
