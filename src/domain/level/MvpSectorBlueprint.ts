import { Nibble } from '../hardware/Nibble';

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  DOOR = 2,
  CORE_TERMINAL = 3,
}

export interface EnemySpawn {
  x: number;
  z: number;
  archetype: 'BITLING' | 'OVERFLOW';
  shieldMask?: Nibble;
}

export interface DoorDefinition {
  x: number;
  z: number;
  lockMask: Nibble;
}

export interface TerminalDefinition {
  x: number;
  z: number;
  conceptId: string;
}

export interface PickupSpawn {
  x: number;
  z: number;
  type: 'HP' | 'SHLD' | 'AMMO';
  amount: number;
}

/**
 * Blueprint declarativo do setor único do MVP (Seção 8.3 do ERS).
 * 1. Setor de Boot (Área Segura)
 * 2. Barramento de Dados (3x BITLING)
 * 3. Porta Lógica 01 (Trava 1010)
 * 4. Câmara da ULA (1x OVERFLOW + 2x BITLING)
 * 5. Câmara do Núcleo Central (2x OVERFLOW + 3x BITLING + Terminal do Núcleo)
 */
export class MvpSectorBlueprint {
  public static create() {
    // Mapa 12 colunas x 36 linhas (progressão ao longo do eixo Z)
    const width = 12;
    const height = 36;
    const grid: CellType[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => CellType.WALL)
    );

    // Esculpe salas e corredores:
    // Sala 1: Boot Sector (z: 1..6, x: 2..9)
    for (let z = 1; z <= 6; z++) {
      for (let x = 2; x <= 9; x++) {
        grid[z]![x] = CellType.EMPTY;
      }
    }

    // Corredor Barramento (z: 7..14, x: 4..7)
    for (let z = 7; z <= 14; z++) {
      for (let x = 4; x <= 7; x++) {
        grid[z]![x] = CellType.EMPTY;
      }
    }

    // Porta Lógica 01 (z: 15, x: 5..6)
    grid[15]![5] = CellType.DOOR;
    grid[15]![6] = CellType.DOOR;

    // Sala 2: Câmara da ULA (z: 16..23, x: 2..9)
    for (let z = 16; z <= 23; z++) {
      for (let x = 2; x <= 9; x++) {
        grid[z]![x] = CellType.EMPTY;
      }
    }

    // Corredor Conector (z: 24..26, x: 5..6)
    for (let z = 24; z <= 26; z++) {
      for (let x = 5; x <= 6; x++) {
        grid[z]![x] = CellType.EMPTY;
      }
    }

    // Sala 3: Câmara do Núcleo Central (z: 27..34, x: 1..10)
    for (let z = 27; z <= 34; z++) {
      for (let x = 1; x <= 10; x++) {
        grid[z]![x] = CellType.EMPTY;
      }
    }

    // Terminal do Núcleo Central no fundo (z: 34, x: 5)
    grid[34]![5] = CellType.CORE_TERMINAL;

    const enemies: EnemySpawn[] = [
      // Barramento
      { x: 5.5, z: 9.5, archetype: 'BITLING' },
      { x: 4.5, z: 11.5, archetype: 'BITLING' },
      { x: 6.5, z: 13.5, archetype: 'BITLING' },

      // Câmara da ULA
      {
        x: 5.5,
        z: 20.5,
        archetype: 'OVERFLOW',
        shieldMask: Nibble.fromBinaryString('1100'),
      },
      { x: 3.5, z: 18.5, archetype: 'BITLING' },
      { x: 7.5, z: 18.5, archetype: 'BITLING' },

      // Câmara do Núcleo Central
      {
        x: 4.0,
        z: 30.5,
        archetype: 'OVERFLOW',
        shieldMask: Nibble.fromBinaryString('1010'),
      },
      {
        x: 7.0,
        z: 30.5,
        archetype: 'OVERFLOW',
        shieldMask: Nibble.fromBinaryString('1111'),
      },
      { x: 3.0, z: 29.0, archetype: 'BITLING' },
      { x: 8.0, z: 29.0, archetype: 'BITLING' },
      { x: 5.5, z: 32.0, archetype: 'BITLING' },
    ];

    const doors: DoorDefinition[] = [
      { x: 5.5, z: 15.0, lockMask: Nibble.fromBinaryString('1010') },
    ];

    const terminals: TerminalDefinition[] = [
      { x: 3.0, z: 2.0, conceptId: 'CPU' },
      { x: 8.0, z: 2.0, conceptId: 'REGISTERS' },
      { x: 3.0, z: 17.0, conceptId: 'ALU' },
      { x: 8.0, z: 17.0, conceptId: 'INSTRUCTION_CYCLE' },
    ];

    const pickups: PickupSpawn[] = [
      { x: 5.5, z: 8.0, type: 'AMMO', amount: 25 },
      { x: 3.0, z: 19.0, type: 'HP', amount: 25 },
      { x: 8.0, z: 19.0, type: 'SHLD', amount: 25 },
      { x: 2.0, z: 28.0, type: 'AMMO', amount: 30 },
      { x: 9.0, z: 28.0, type: 'HP', amount: 35 },
    ];

    return {
      width,
      height,
      grid,
      playerSpawn: { x: 5.5, z: 3.0, yaw: 0 },
      coreTerminal: { x: 5.5, z: 34.0 },
      enemies,
      doors,
      terminals,
      pickups,
    };
  }
}
