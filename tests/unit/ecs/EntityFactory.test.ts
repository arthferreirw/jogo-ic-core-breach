import { describe, it, expect } from 'vitest';
import { World } from '@ecs/core/World';
import { EntityFactory } from '@ecs/factories/EntityFactory';
import { Nibble } from '@domain/hardware/Nibble';

describe('ECS: EntityFactory', () => {
  it('deve instanciar jogador com componentes e atributos corretos', () => {
    const world = new World();
    const player = EntityFactory.createPlayer(world, 2, 4);

    expect(world.isAlive(player)).toBe(true);
    expect(world.getComponent(player, 'transform')?.x).toBe(2);
    expect(world.getComponent(player, 'health')?.current).toBe(100);
    expect(world.getComponent(player, 'shield')?.current).toBe(100);
    expect(world.hasComponent(player, 'weapon')).toBe(true);
    expect(world.hasComponent(player, 'logicalPulse')).toBe(true);
  });

  it('deve instanciar BITLING e OVERFLOW com arquétipos e estados adequados', () => {
    const world = new World();
    const bitling = EntityFactory.createBitling(world, 5, 5);
    const overflow = EntityFactory.createOverflow(world, 10, 10, Nibble.fromBinaryString('1100'));

    expect(world.getComponent(bitling, 'aiFsm')?.archetype).toBe('BITLING');
    expect(world.getComponent(bitling, 'health')?.current).toBe(40);
    expect(world.hasComponent(bitling, 'binaryLock')).toBe(false);

    expect(world.getComponent(overflow, 'aiFsm')?.archetype).toBe('OVERFLOW');
    expect(world.getComponent(overflow, 'health')?.current).toBe(100);
    expect(world.getComponent(overflow, 'binaryLock')?.mask.toBinaryString()).toBe('1100');
    expect(world.getComponent(overflow, 'binaryLock')?.active).toBe(true);
  });

  it('deve instanciar porta lógica com trava de 4 bits fechada', () => {
    const world = new World();
    const door = EntityFactory.createLogicDoor(world, 15, 20, Nibble.fromBinaryString('1010'));

    expect(world.getComponent(door, 'binaryLock')?.mask.toBinaryString()).toBe('1010');
    expect(world.getComponent(door, 'doorSlide')?.isOpen).toBe(false);
    expect(world.getComponent(door, 'doorSlide')?.lockedByZf).toBe(true);
  });

  it('deve instanciar terminal e pickups de itens', () => {
    const world = new World();
    const terminal = EntityFactory.createTerminal(world, 3, 3, 'CPU');
    const pickup = EntityFactory.createPickup(world, 4, 4, 'AMMO', 20);

    expect(world.getComponent(terminal, 'terminal')?.conceptId).toBe('CPU');
    expect(world.getComponent(pickup, 'pickup')?.type).toBe('AMMO');
    expect(world.getComponent(pickup, 'pickup')?.amount).toBe(20);
  });
});
