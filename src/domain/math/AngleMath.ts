/**
 * Funções matemáticas para manipulação de ângulos e rotações da câmera FPS.
 */
export class AngleMath {
  /**
   * Trava o ângulo vertical (pitch) entre -limitDeg e +limitDeg.
   * Por padrão [-75°, +75°].
   */
  public static clampPitch(pitchRad: number, limitDeg: number = 75): number {
    const limitRad = (limitDeg * Math.PI) / 180;
    return Math.max(-limitRad, Math.min(limitRad, pitchRad));
  }

  /**
   * Normaliza um ângulo yaw para permanecer entre 0 e 2*PI radianos.
   */
  public static wrapYaw(yawRad: number): number {
    const twoPi = Math.PI * 2;
    let wrapped = yawRad % twoPi;
    if (wrapped < 0) {
      wrapped += twoPi;
    }
    return wrapped;
  }
}
