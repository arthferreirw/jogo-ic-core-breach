import { EntityId, ComponentMap, ComponentName } from '../components/CombatComponents';

/**
 * Kernel ECS central.
 * Gerencia entidades e coleções de componentes tipadas sem acoplamento externo.
 */
export class World {
  private nextEntityId: EntityId = 1;
  private aliveEntities: Set<EntityId> = new Set();
  private stores: {
    [K in ComponentName]?: Map<EntityId, ComponentMap[K]>;
  } = {};

  public createEntity(): EntityId {
    const id = this.nextEntityId++;
    this.aliveEntities.add(id);
    return id;
  }

  public isAlive(id: EntityId): boolean {
    return this.aliveEntities.has(id);
  }

  public destroyEntity(id: EntityId): void {
    if (!this.aliveEntities.has(id)) return;

    for (const storeKey of Object.keys(this.stores) as ComponentName[]) {
      this.stores[storeKey]?.delete(id);
    }
    this.aliveEntities.delete(id);
  }

  public addComponent<K extends ComponentName>(
    entity: EntityId,
    name: K,
    component: ComponentMap[K]
  ): void {
    if (!this.aliveEntities.has(entity)) {
      throw new Error(`Não é possível adicionar componente a entidade inexistente: ${entity}`);
    }

    if (!this.stores[name]) {
      this.stores[name] = new Map();
    }
    this.stores[name]!.set(entity, component);
  }

  public getComponent<K extends ComponentName>(
    entity: EntityId,
    name: K
  ): ComponentMap[K] | undefined {
    return this.stores[name]?.get(entity) as ComponentMap[K] | undefined;
  }

  public hasComponent(entity: EntityId, name: ComponentName): boolean {
    return Boolean(this.stores[name]?.has(entity));
  }

  public removeComponent(entity: EntityId, name: ComponentName): void {
    this.stores[name]?.delete(entity);
  }

  /**
   * Retorna todas as entidades vivas que possuem TODOS os componentes listados.
   */
  public query(componentNames: ComponentName[]): EntityId[] {
    const matching: EntityId[] = [];

    for (const entity of this.aliveEntities) {
      let matchesAll = true;
      for (const name of componentNames) {
        if (!this.stores[name]?.has(entity)) {
          matchesAll = false;
          break;
        }
      }
      if (matchesAll) {
        matching.push(entity);
      }
    }

    return matching;
  }

  public clear(): void {
    this.aliveEntities.clear();
    this.stores = {};
    this.nextEntityId = 1;
  }
}
