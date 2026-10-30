import { PALETTE } from '@domain/config/GameBalance';

/**
 * Adaptador de síntese procedural de texturas e sprites pixel-art RGBA (Canvas2D).
 * Fiel à direção visual retrô sci-fi dos anos 90 e paleta oficial.
 */
export class ProceduralPixelAssetAdapter {
  public static createWallTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Fundo metálico escuro
    ctx.fillStyle = PALETTE.METAL_DARK;
    ctx.fillRect(0, 0, 64, 64);

    // Trilhas de circuito ciano
    ctx.strokeStyle = PALETTE.ELECTRIC_CYAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(10, 24);
    ctx.lineTo(32, 24);
    ctx.lineTo(32, 64);
    ctx.moveTo(54, 0);
    ctx.lineTo(54, 40);
    ctx.lineTo(40, 40);
    ctx.lineTo(40, 64);
    ctx.stroke();

    // Nós de dados laranja
    ctx.fillStyle = PALETTE.ALERT_ORANGE;
    ctx.fillRect(8, 22, 5, 5);
    ctx.fillRect(38, 38, 5, 5);

    // Moldura de placa metálica
    ctx.strokeStyle = '#2A3B4D';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    return canvas.toDataURL('image/png');
  }

  public static createFloorTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0B1118';
    ctx.fillRect(0, 0, 64, 64);

    // Grid de piso industrial com parafusos
    ctx.strokeStyle = '#1B2631';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 60, 60);

    ctx.fillStyle = '#39FF88';
    ctx.fillRect(30, 30, 4, 4); // LED central verde

    return canvas.toDataURL('image/png');
  }

  public static createDoorTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#182430';
    ctx.fillRect(0, 0, 64, 64);

    // Faixas de advertência industrial
    ctx.fillStyle = PALETTE.ALERT_ORANGE;
    for (let i = -64; i < 128; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 8, 0);
      ctx.lineTo(i + 8 + 64, 64);
      ctx.lineTo(i + 64, 64);
      ctx.fill();
    }

    // Painel central blindado
    ctx.fillStyle = PALETTE.METAL_DARK;
    ctx.fillRect(12, 12, 40, 40);
    ctx.strokeStyle = PALETTE.ELECTRIC_CYAN;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 40, 40);

    return canvas.toDataURL('image/png');
  }

  public static createBitlingSprite(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 32, 32);

    // Silhueta do Bitling (Garras metálicas escuras)
    ctx.fillStyle = '#101820';
    ctx.fillRect(8, 6, 16, 20);
    ctx.fillRect(4, 12, 4, 12);
    ctx.fillRect(24, 12, 4, 12);

    // Núcleo energético verde ácido pulsante
    ctx.fillStyle = PALETTE.TERMINAL_GREEN;
    ctx.fillRect(10, 10, 12, 12);

    // Olhos em alerta laranja
    ctx.fillStyle = PALETTE.ALERT_ORANGE;
    ctx.fillRect(12, 13, 3, 3);
    ctx.fillRect(17, 13, 3, 3);

    return canvas.toDataURL('image/png');
  }

  public static createOverflowSprite(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 48, 48);

    // Blindagem de mech pesado
    ctx.fillStyle = '#141E28';
    ctx.fillRect(8, 8, 32, 32);

    // Esteiras / pernas
    ctx.fillStyle = '#0A0F14';
    ctx.fillRect(6, 36, 12, 10);
    ctx.fillRect(30, 36, 12, 10);

    // Canhão de plasma direito
    ctx.fillStyle = '#2A3B4D';
    ctx.fillRect(2, 16, 8, 16);

    // Escudo/núcleo ciano elétrico
    ctx.fillStyle = PALETTE.ELECTRIC_CYAN;
    ctx.fillRect(16, 14, 16, 18);

    // Destaques de alerta
    ctx.fillStyle = PALETTE.ALERT_ORANGE;
    ctx.fillRect(18, 10, 12, 3);

    return canvas.toDataURL('image/png');
  }

  public static createPulse9WeaponSprite(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 140;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 120, 140);

    // Corpo da pistola Sci-Fi (PULSE-9)
    ctx.fillStyle = '#1A232E';
    ctx.fillRect(40, 30, 40, 90);

    // Cano e mira
    ctx.fillStyle = '#0F161E';
    ctx.fillRect(46, 10, 28, 30);

    // Display verde na traseira
    ctx.fillStyle = PALETTE.TERMINAL_GREEN;
    ctx.fillRect(48, 50, 24, 18);

    // Câmara de plasma ciano
    ctx.fillStyle = PALETTE.ELECTRIC_CYAN;
    ctx.fillRect(50, 75, 20, 35);

    // Destaques em laranja
    ctx.fillStyle = PALETTE.ALERT_ORANGE;
    ctx.fillRect(38, 90, 4, 20);
    ctx.fillRect(78, 90, 4, 20);

    return canvas.toDataURL('image/png');
  }
}
