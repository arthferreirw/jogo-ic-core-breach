export interface RenderEntityState {
  id: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  type: 'PLAYER' | 'BITLING' | 'OVERFLOW' | 'DOOR' | 'TERMINAL' | 'PICKUP' | 'CORE';
  subtype?: string;
  isStunned?: boolean;
  hasShield?: boolean;
  shieldMask?: string;
  isDead?: boolean;
  slideProgress?: number; // Para portas
}

export interface IRenderPort {
  init(canvas: HTMLCanvasElement): Promise<void>;
  buildLevel(grid: number[][], width: number, height: number): void;
  syncEntities(entities: RenderEntityState[]): void;
  render(): void;
  triggerMuzzleFlash(): void;
  triggerImpactFlash(x: number, y: number, z: number): void;
  triggerPlayerDamageFlash(): void;
  reset(): void;
  dispose(): void;
}
