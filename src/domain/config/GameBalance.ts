/**
 * Parâmetros centrais de balanceamento e constantes imutáveis do jogo Breach Core.
 * Baseado estritamente nas especificações de RN-01 a RN-05 e Seção 6 do ERS.
 */
export const GAME_TITLE = 'CORE BREACH' as const;

export const PALETTE = {
  METAL_DARK: '#101820',
  TERMINAL_GREEN: '#39FF88',
  ELECTRIC_CYAN: '#00D9FF',
  ALERT_ORANGE: '#FF9D36',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

export const PLAYER_BALANCE = {
  INITIAL_HP: 100,
  MAX_HP: 100,
  INITIAL_SHIELD: 100,
  MAX_SHIELD: 100,
  SPEED: 7.5,
  PITCH_LIMIT_DEG: 75,
} as const;

export const WEAPON_BALANCE = {
  PULSE9_DAMAGE: 20,
  FIRE_RATE_PER_SEC: 4,
  INITIAL_AMMO: 99,
  MAX_AMMO: 150,
  EMERGENCY_REGEN_INTERVAL_SEC: 1.5,
  EMERGENCY_REGEN_MAX_AMMO: 10,
} as const;

export const LOGICAL_PULSE_BALANCE = {
  COOLDOWN_SEC: 3.0,
  MAX_RANGE: 25.0,
  STUN_DURATION_SEC: 1.5,
  SHIELD_DAMAGE_MITIGATION: 0.8, // Mitigação de 80% enquanto o escudo binário estiver ativo
} as const;

export const INSTRUCTION_CYCLE_BALANCE = {
  STAGE_DURATION_MS: 250, // 250ms por estágio: FETCH -> DECODE -> EXECUTE -> STORE
} as const;

export const ENEMY_BALANCE = {
  BITLING: {
    NAME: 'BITLING',
    HP: 40,
    SPEED: 5.5,
    ATTACK_RANGE: 1.8,
    ATTACK_DAMAGE: 12,
    ATTACK_INTERVAL_SEC: 1.0,
    SCORE: 100,
  },
  OVERFLOW: {
    NAME: 'OVERFLOW',
    HP: 100,
    SPEED: 2.5,
    ATTACK_RANGE: 20.0,
    PROJECTILE_SPEED: 14.0,
    ATTACK_DAMAGE: 18,
    ATTACK_INTERVAL_SEC: 1.8,
    SCORE: 300,
    BONUS_ZF_SCORE: 150, // Bônus de Eficiência Lógica ao zerar escudo no 1º pulso (ZF=1)
  },
} as const;

export const SCORE_VALUES = {
  DEFEAT_BITLING: 100,
  DEFEAT_OVERFLOW: 300,
  BONUS_LOGICAL_EFFICIENCY: 150,
  CONCEPT_UNLOCKED: 100,
  RESTORE_CORE: 500,
} as const;
