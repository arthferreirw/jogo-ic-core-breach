import { describe, it, expect } from 'vitest';
import { Vec2 } from '@domain/math/Vec2';
import { AngleMath } from '@domain/math/AngleMath';
import { CollisionMath } from '@domain/math/CollisionMath';
import { DdaRaycaster } from '@domain/math/DdaRaycaster';
import { MvpSectorBlueprint, CellType } from '@domain/level/MvpSectorBlueprint';

describe('Domain: Spatial Math, DDA Raycasting & Sector Blueprint', () => {
  describe('Vec2 & Normalização Diagonal', () => {
    it('deve somar, subtrair e escalar vetores 2D', () => {
      const v1 = new Vec2(3, 4);
      const v2 = new Vec2(1, 2);

      expect(v1.add(v2)).toEqual(new Vec2(4, 6));
      expect(v1.sub(v2)).toEqual(new Vec2(2, 2));
      expect(v1.scale(2)).toEqual(new Vec2(6, 8));
      expect(v1.magnitude()).toBe(5);
    });

    it('deve normalizar vetores diagonais com magnitude 1.0 (evitando velocidade extra com W+D)', () => {
      const diagonal = new Vec2(1, 1).normalize();
      expect(diagonal.magnitude()).toBeCloseTo(1.0, 5);
      expect(diagonal.x).toBeCloseTo(Math.SQRT1_2, 5);
      expect(diagonal.y).toBeCloseTo(Math.SQRT1_2, 5);

      const zero = new Vec2(0, 0).normalize();
      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
    });
  });

  describe('AngleMath', () => {
    it('deve limitar o pitch entre -75° e +75° em radianos', () => {
      const limitRad = (75 * Math.PI) / 180;
      const clampedHigh = AngleMath.clampPitch((90 * Math.PI) / 180, 75);
      const clampedLow = AngleMath.clampPitch((-85 * Math.PI) / 180, 75);

      expect(clampedHigh).toBeCloseTo(limitRad, 5);
      expect(clampedLow).toBeCloseTo(-limitRad, 5);
    });
  });

  describe('CollisionMath & Wall-Sliding', () => {
    it('deve resolver colisão e aplicar wall-sliding contra uma parede vertical', () => {
      // Jogador movendo-se para a direita e para cima com parede sólida à direita
      const velocity = new Vec2(0.4, 0.5); // Quer andar para a direita e para cima
      const normal = new Vec2(-1, 0); // Parede à direita

      const slideVelocity = CollisionMath.calculateSlideVelocity(velocity, normal);
      // Deve anular a componente X (para dentro da parede) e manter a componente Y
      expect(slideVelocity.x).toBe(0);
      expect(slideVelocity.y).toBe(0.5);
    });
  });

  describe('DdaRaycaster & Grid Traversal', () => {
    it('deve traçar raio em linha reta e detectar colisão com parede no grid', () => {
      // Grid 5x5: paredes no contorno
      const grid: CellType[][] = [
        [CellType.WALL, CellType.WALL, CellType.WALL, CellType.WALL, CellType.WALL],
        [CellType.WALL, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.WALL],
        [CellType.WALL, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.WALL],
        [CellType.WALL, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.WALL],
        [CellType.WALL, CellType.WALL, CellType.WALL, CellType.WALL, CellType.WALL],
      ];

      const origin = new Vec2(2.5, 2.5); // Centro da célula (2, 2)
      const dirRight = new Vec2(1, 0);

      const hit = DdaRaycaster.cast(origin, dirRight, 10, (cellX, cellY) => {
        return grid[cellY]?.[cellX] === CellType.WALL;
      });

      expect(hit).not.toBeNull();
      expect(hit?.cellX).toBe(4); // Atinge a parede em x=4
      expect(hit?.cellY).toBe(2);
      expect(hit?.distance).toBeCloseTo(1.5, 2); // De 2.5 até 4.0
    });
  });

  describe('MvpSectorBlueprint', () => {
    it('deve conter as 5 áreas sequenciais do MVP com spawns válidos', () => {
      const blueprint = MvpSectorBlueprint.create();
      expect(blueprint.width).toBeGreaterThan(0);
      expect(blueprint.height).toBeGreaterThan(0);
      expect(blueprint.playerSpawn).toBeDefined();
      expect(blueprint.enemies.length).toBeGreaterThanOrEqual(5); // Pelo menos 5 encontros
      expect(blueprint.doors.length).toBeGreaterThanOrEqual(1); // Porta Lógica 01
      expect(blueprint.coreTerminal).toBeDefined(); // Terminal do Núcleo
    });
  });
});
