import { EventBus } from '@app/events/EventBus';
import { RegisterBank } from '@domain/hardware/RegisterBank';
import { CycleStage } from '@domain/hardware/InstructionCycleTracker';
import { ProceduralPixelAssetAdapter } from '@infra/assets/ProceduralPixelAssetAdapter';

/**
 * Apresentador do HUD minimalista em HTML5/CSS3.
 */
export class HudPresenter {
  private hpVal = document.getElementById('hudHpVal');
  private hpBar = document.getElementById('hudHpBar');
  private shldVal = document.getElementById('hudShldVal');
  private shldBar = document.getElementById('hudShldBar');
  private ammoVal = document.getElementById('hudAmmoVal');
  private scoreVal = document.getElementById('hudScore');
  private objectiveVal = document.getElementById('hudObjective');
  private regStatus = document.getElementById('hudRegStatus');
  private pulseCooldown = document.getElementById('hudPulseCooldown');
  private toastEl = document.getElementById('terminalToast');

  private stepFetch = document.getElementById('stepFetch');
  private stepDecode = document.getElementById('stepDecode');
  private stepExecute = document.getElementById('stepExecute');
  private stepStore = document.getElementById('stepStore');

  private toastTimeout: number | null = null;

  constructor(private eventBus: EventBus, private registerBank: RegisterBank) {
    this.initViewmodel();
    this.setupSubscriptions();
  }

  private initViewmodel(): void {
    const el = document.getElementById('weaponViewmodel');
    if (el) {
      el.style.backgroundImage = `url(${ProceduralPixelAssetAdapter.createPulse9WeaponSprite()})`;
    }
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('PLAYER_HEALTH_CHANGED', ({ hp, shield }) => {
      if (this.hpVal) this.hpVal.textContent = String(Math.ceil(hp));
      if (this.hpBar) this.hpBar.style.width = `${Math.max(0, hp)}%`;
      if (this.shldVal) this.shldVal.textContent = String(Math.ceil(shield));
      if (this.shldBar) this.shldBar.style.width = `${Math.max(0, shield)}%`;
    });

    this.eventBus.subscribe('PLAYER_AMMO_CHANGED', ({ ammo }) => {
      if (this.ammoVal) this.ammoVal.textContent = String(ammo);
    });

    this.eventBus.subscribe('SCORE_CHANGED', ({ score }) => {
      if (this.scoreVal) {
        this.scoreVal.textContent = `SCORE: ${String(score).padStart(5, '0')}`;
      }
    });

    this.eventBus.subscribe('ALU_OPERATION_EXECUTED', (data) => {
      if (this.regStatus) {
        const flag = data.zeroFlag ? '[ZF=1]' : '[ZF=0]';
        this.regStatus.textContent = `${data.operandA} ^ ${data.operandB} = ${data.result} ${flag}`;
      }
    });

    this.eventBus.subscribe('CONCEPT_DISCOVERED', (data) => {
      this.showToast(data.shortToast);
    });
  }

  public updateDistance(distanceMeters: number): void {
    if (this.objectiveVal) {
      this.objectiveVal.textContent = `< CORE BREACH: ${Math.round(distanceMeters)}m >`;
    }
  }

  public updateCycleStage(stage: CycleStage): void {
    this.stepFetch?.classList.toggle('active', stage === CycleStage.FETCH);
    this.stepDecode?.classList.toggle('active', stage === CycleStage.DECODE);
    this.stepExecute?.classList.toggle('active', stage === CycleStage.EXECUTE);
    this.stepStore?.classList.toggle('active', stage === CycleStage.STORE);
  }

  public updateRegA(): void {
    if (this.regStatus && !this.regStatus.textContent?.includes('^')) {
      this.regStatus.textContent = `REG_A: ${this.registerBank.getRegA().toBinaryString()} | TARGET: ----`;
    }
  }

  public updatePulseCooldown(remainingSec: number): void {
    if (this.pulseCooldown) {
      if (remainingSec <= 0) {
        this.pulseCooldown.textContent = 'PULSO XOR: PRONTO [Q]';
        this.pulseCooldown.style.color = 'var(--color-terminal-green)';
      } else {
        this.pulseCooldown.textContent = `PULSO XOR: RECARREGANDO (${remainingSec.toFixed(1)}s)`;
        this.pulseCooldown.style.color = 'var(--color-alert-orange)';
      }
    }
  }

  public showToast(text: string): void {
    if (!this.toastEl) return;
    this.toastEl.textContent = text;
    this.toastEl.style.display = 'block';

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = window.setTimeout(() => {
      if (this.toastEl) {
        this.toastEl.style.display = 'none';
      }
    }, 5500);
  }
}
