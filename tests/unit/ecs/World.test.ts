import { describe, it, expect } from 'vitest';
import { World } from '@ecs/core/World';
import { TransformComponent, HealthComponent } from '@ecs/components/CombatComponents';

describe('ECS: World & Entity Component System Kernel', () => {
  it('deve criar e destruir entidades com IDs sequenciais únicos', () => {
    const world = new World();
    const e1 = world.createEntity();
    const e2 = world.createEntity();

    expect(e1).toBe(1);
    expect(e2).toBe(2);
    expect(world.isAlive(e1)).toBe(true);

    world.destroyEntity(e1);
    expect(world.isAlive(e1)).toBe(false);
    expect(world.isAlive(e2)).toBe(true);
  });

  it('deve adicionar, consultar e remover componentes de uma entidade', () => {
    const world = new World();
    const entity = world.createEntity();

    const transform: TransformComponent = { x: 10, y: 0, z: 20, yaw: 0, pitch: 0 };
    const health: HealthComponent = { current: 100, max: 100 };

    world.addComponent(entity, 'transform', transform);
    world.addComponent(entity, 'health', health);

    expect(world.hasComponent(entity, 'transform')).toBe(true);
    expect(world.getComponent(entity, 'transform')).toEqual(transform);
    expect(world.getComponent(entity, 'health')?.current).toBe(100);

    world.removeComponent(entity, 'health');
    expect(world.hasComponent(entity, 'health')).toBe(false);
    expect(world.getComponent(entity, 'health')).toBeUndefined();
  });

  it('deve realizar queries eficientes de entidades que possuem conjunto específico de componentes', () => {
    const world = new World();

    const e1 = world.createEntity();
    world.addComponent(e1, 'transform', { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 });
    world.addComponent(e1, 'velocity', { vx: 1, vz: 1 });

    const e2 = world.createEntity();
    world.addComponent(e2, 'transform', { x: 5, y: 0, z: 5, yaw: 0, pitch: 0 });

    const e3 = world.createEntity();
    world.addComponent(e3, 'transform', { x: 10, y: 0, z: 10, yaw: 0, pitch: 0 });
    world.addComponent(e3, 'velocity', { vx: -1, vz: 0 });

    // Consulta apenas entidades que possuem 'transform' E 'velocity'
    const movingEntities = world.query(['transform', 'velocity']);
    expect(movingEntities).toEqual([e1, e3]);

    const allWithTransform = world.query(['transform']);
    expect(allWithTransform).toEqual([e1, e2, e3]);
  });

  it('deve limpar todos os componentes ao destruir uma entidade', () => {
    const world = new World();
    const entity = world.createEntity();
    world.addComponent(entity, 'health', { current: 50, max: 100 });

    world.destroyEntity(entity);
    expect(world.getComponent(entity, 'health')).toBeUndefined();
    expect(world.query(['health'])).toEqual([]);
  });
});
