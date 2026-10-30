import { Nibble } from '@domain/hardware/Nibble';

export type EntityId = number;

export interface TransformComponent {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export interface VelocityComponent {
  vx: number;
  vz: number;
}

export interface ColliderComponent {
  radius: number;
  isSolid: boolean;
}

export interface HealthComponent {
  current: number;
  max: number;
}

export interface ShieldComponent {
  current: number;
  max: number;
}

export interface BinaryLockComponent {
  mask: Nibble;
  active: boolean;
  stunTimerSec: number;
}

export interface WeaponComponent {
  cooldownTimerSec: number;
}

export interface LogicalPulseComponent {
  cooldownTimerSec: number;
}

export interface AiFsmComponent {
  archetype: 'BITLING' | 'OVERFLOW';
  state: 'IDLE' | 'CHASE' | 'ATTACK' | 'STUNNED' | 'DEAD';
  stateTimerSec: number;
  attackCooldownSec: number;
}

export interface DoorSlideComponent {
  isOpen: boolean;
  slideProgress: number; // 0.0 (fechada) a 1.0 (aberta)
  lockedByZf: boolean;
}

export interface TerminalComponent {
  conceptId: string;
  interacted: boolean;
}

export interface PickupComponent {
  type: 'HP' | 'SHLD' | 'AMMO';
  amount: number;
}

export interface ComponentMap {
  transform: TransformComponent;
  velocity: VelocityComponent;
  collider: ColliderComponent;
  health: HealthComponent;
  shield: ShieldComponent;
  binaryLock: BinaryLockComponent;
  weapon: WeaponComponent;
  logicalPulse: LogicalPulseComponent;
  aiFsm: AiFsmComponent;
  doorSlide: DoorSlideComponent;
  terminal: TerminalComponent;
  pickup: PickupComponent;
}

export type ComponentName = keyof ComponentMap;
