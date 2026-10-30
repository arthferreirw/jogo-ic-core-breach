import { PEDAGOGICAL_CATALOG, PedagogicalConcept } from '../config/PedagogicalCatalog';

/**
 * Gestor do Códice de conceitos pedagógicos (RN-06).
 * Mantém os conceitos desbloqueados e impede a exibição redundante de notificações durante o combate.
 */
export class CodexTracker {
  private discoveredIds: Set<string> = new Set();

  /**
   * Tenta registrar a descoberta de um conceito.
   * Retorna `true` se o conceito foi descoberto pela primeira vez nesta sessão (disparando o toast).
   */
  public discoverConcept(conceptId: string): boolean {
    if (!PEDAGOGICAL_CATALOG[conceptId]) {
      return false;
    }

    if (this.discoveredIds.has(conceptId)) {
      return false; // Já descoberto anteriormente: não repete o toast
    }

    this.discoveredIds.add(conceptId);
    return true;
  }

  public isDiscovered(conceptId: string): boolean {
    return this.discoveredIds.has(conceptId);
  }

  public getDiscoveredCount(): number {
    return this.discoveredIds.size;
  }

  public getTotalConceptsCount(): number {
    return Object.keys(PEDAGOGICAL_CATALOG).length;
  }

  public getAllConcepts(): { concept: PedagogicalConcept; unlocked: boolean }[] {
    return Object.values(PEDAGOGICAL_CATALOG).map((concept) => ({
      concept,
      unlocked: this.discoveredIds.has(concept.id),
    }));
  }

  public reset(): void {
    this.discoveredIds.clear();
  }
}
