export interface DomainEventMap {
  ALU_OPERATION_EXECUTED: {
    operandA: string;
    operandB: string;
    result: string;
    zeroFlag: boolean;
  };
  INSTRUCTION_CYCLE_STAGE_CHANGED: {
    stage: 'IDLE' | 'FETCH' | 'DECODE' | 'EXECUTE' | 'STORE';
  };
  PLAYER_HEALTH_CHANGED: {
    hp: number;
    shield: number;
  };
  PLAYER_AMMO_CHANGED: {
    ammo: number;
    maxAmmo: number;
  };
  SCORE_CHANGED: {
    score: number;
  };
  CONCEPT_DISCOVERED: {
    conceptId: string;
    title: string;
    shortToast: string;
  };
  GAME_STATE_CHANGED: {
    previousState: string;
    newState: string;
  };
}

export type EventKey = keyof DomainEventMap;
export type EventCallback<K extends EventKey> = (payload: DomainEventMap[K]) => void;

/**
 * Barramento de eventos Observer tipado.
 */
export class EventBus {
  private listeners: Map<EventKey, Set<(payload: any) => void>> = new Map();

  public subscribe<K extends EventKey>(event: K, callback: EventCallback<K>): () => void {
    let subs = this.listeners.get(event);
    if (!subs) {
      subs = new Set();
      this.listeners.set(event, subs);
    }
    subs.add(callback as (payload: any) => void);

    return () => {
      subs?.delete(callback as (payload: any) => void);
    };
  }

  public publish<K extends EventKey>(event: K, payload: DomainEventMap[K]): void {
    const subs = this.listeners.get(event);
    if (!subs) return;
    for (const callback of subs) {
      callback(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
