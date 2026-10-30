export enum GameState {
  BOOT = 'BOOT',
  MAIN_MENU = 'MAIN_MENU',
  CONTROLS_MODAL = 'CONTROLS_MODAL',
  ONBOARDING = 'ONBOARDING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  DEBRIEF_VICTORY = 'DEBRIEF_VICTORY',
  DEBRIEF_DEFEAT = 'DEBRIEF_DEFEAT',
}

/**
 * Máquina de estados global do jogo (FSM da Seção 2.1 do ERS).
 */
export class GameStateMachine {
  private currentState: GameState = GameState.BOOT;

  private validTransitions: Record<GameState, GameState[]> = {
    [GameState.BOOT]: [GameState.MAIN_MENU],
    [GameState.MAIN_MENU]: [GameState.CONTROLS_MODAL, GameState.ONBOARDING, GameState.PLAYING],
    [GameState.CONTROLS_MODAL]: [GameState.MAIN_MENU],
    [GameState.ONBOARDING]: [GameState.PLAYING],
    [GameState.PLAYING]: [
      GameState.PAUSED,
      GameState.DEBRIEF_VICTORY,
      GameState.DEBRIEF_DEFEAT,
    ],
    [GameState.PAUSED]: [GameState.PLAYING, GameState.MAIN_MENU],
    [GameState.DEBRIEF_VICTORY]: [GameState.PLAYING, GameState.MAIN_MENU],
    [GameState.DEBRIEF_DEFEAT]: [GameState.PLAYING, GameState.MAIN_MENU],
  };

  public getCurrentState(): GameState {
    return this.currentState;
  }

  public canTransitionTo(target: GameState): boolean {
    const allowed = this.validTransitions[this.currentState];
    return Boolean(allowed?.includes(target));
  }

  public transitionTo(target: GameState): boolean {
    if (!this.canTransitionTo(target)) {
      return false;
    }
    this.currentState = target;
    return true;
  }

  public reset(): void {
    this.currentState = GameState.BOOT;
  }
}
