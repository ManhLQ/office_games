import React from 'react';
import type { IGameRenderer } from '../../core/interfaces/IGameRenderer';
import type { PlayerBoardProps, MiniBoardProps, ControlsProps } from '../../core/interfaces/IGameRenderer';
import { CrosswordPlayerBoard, CrosswordMiniBoard, CrosswordControls } from './CrosswordPlayerBoard';

/**
 * Crossword game renderer
 * Delegates to functional components that can use hooks
 */
export class CrosswordRenderer implements IGameRenderer {
  renderPlayerBoard(props: PlayerBoardProps): React.ReactElement {
    return React.createElement(CrosswordPlayerBoard, props);
  }

  renderMiniBoard(props: MiniBoardProps): React.ReactElement {
    return React.createElement(CrosswordMiniBoard, props);
  }

  renderControls(props: ControlsProps): React.ReactElement {
    return React.createElement(CrosswordControls, props);
  }
}
