export interface InputSnapshot {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  deltaMouseX: number;
  deltaMouseY: number;
  fireWeapon: boolean;
  fireLogicalPulse: boolean;
  cycleRegister: boolean;
  interact: boolean;
  toggleCodex: boolean;
}

export interface IInputPort {
  getSnapshot(): InputSnapshot;
  isPointerLocked(): boolean;
  requestPointerLock(): void;
  exitPointerLock(): void;
  reset(): void;
}
