export interface IAudioPort {
  playPistolShot(): void;
  playLogicalPulse(): void;
  playZeroFlagOverload(): void;
  playShieldDeflect(): void;
  playPlayerHurt(): void;
  playEnemyDeath(): void;
  playDoorSlide(): void;
  playTerminalAccess(): void;
  playVictory(): void;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
}
