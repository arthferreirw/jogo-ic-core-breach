import { WEAPON_BALANCE } from '../config/GameBalance';

/**
 * Gestor do capacitor de munição da arma principal (RN-03).
 * Implementa consumo de tiro e regeneração passiva de emergência quando zerado.
 */
export class AmmoCapacitor {
  private currentAmmo: number;
  private maxAmmo: number;
  private emergencyTimerSec = 0;

  constructor(
    initialAmmo: number = WEAPON_BALANCE.INITIAL_AMMO,
    maxAmmo: number = WEAPON_BALANCE.MAX_AMMO
  ) {
    this.currentAmmo = initialAmmo;
    this.maxAmmo = maxAmmo;
  }

  public consumeShot(): boolean {
    if (this.currentAmmo <= 0) {
      return false;
    }
    this.currentAmmo--;
    return true;
  }

  public addAmmo(amount: number): void {
    this.currentAmmo = Math.min(this.maxAmmo, this.currentAmmo + Math.max(0, amount));
  }

  public update(deltaSec: number): void {
    // Regeneração de emergência caso a munição esteja abaixo do limite mínimo
    if (this.currentAmmo < WEAPON_BALANCE.EMERGENCY_REGEN_MAX_AMMO) {
      this.emergencyTimerSec += deltaSec;
      if (this.emergencyTimerSec >= WEAPON_BALANCE.EMERGENCY_REGEN_INTERVAL_SEC) {
        this.emergencyTimerSec -= WEAPON_BALANCE.EMERGENCY_REGEN_INTERVAL_SEC;
        this.currentAmmo++;
      }
    } else {
      this.emergencyTimerSec = 0;
    }
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  public getMaxAmmo(): number {
    return this.maxAmmo;
  }

  public reset(initialAmmo: number = WEAPON_BALANCE.INITIAL_AMMO): void {
    this.currentAmmo = initialAmmo;
    this.emergencyTimerSec = 0;
  }
}
