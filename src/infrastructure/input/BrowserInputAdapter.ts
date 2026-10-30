import { IInputPort, InputSnapshot } from '@app/ports/IInputPort';

/**
 * Adaptador de entrada para navegadores Desktop.
 * Utiliza KeyboardEvent, MouseEvent e Pointer Lock API.
 */
export class BrowserInputAdapter implements IInputPort {
  private snapshot: InputSnapshot = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    deltaMouseX: 0,
    deltaMouseY: 0,
    fireWeapon: false,
    fireLogicalPulse: false,
    cycleRegister: false,
    interact: false,
    toggleCodex: false,
  };

  private pointerLocked = false;
  private canvas: HTMLCanvasElement | null = null;
  private onPauseRequested?: () => void;

  constructor(onPauseRequested?: () => void) {
    this.onPauseRequested = onPauseRequested;
    this.setupListeners();
  }

  public bindCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.canvas.addEventListener('click', () => {
      if (!this.pointerLocked) {
        this.requestPointerLock();
      }
    });
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    window.addEventListener('wheel', () => {
      this.snapshot.cycleRegister = true;
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (!this.pointerLocked && this.onPauseRequested) {
        this.onPauseRequested(); // Auto-pausa ao perder Pointer Lock
      }
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.snapshot.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.snapshot.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.snapshot.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.snapshot.moveRight = true;
        break;
      case 'KeyQ':
        this.snapshot.fireLogicalPulse = true;
        break;
      case 'KeyR':
        this.snapshot.cycleRegister = true;
        break;
      case 'KeyE':
        this.snapshot.interact = true;
        break;
      case 'Tab':
        e.preventDefault();
        this.snapshot.toggleCodex = true;
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.snapshot.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.snapshot.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.snapshot.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.snapshot.moveRight = false;
        break;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.pointerLocked) return;
    this.snapshot.deltaMouseX += e.movementX;
    this.snapshot.deltaMouseY += e.movementY;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (!this.pointerLocked) return;
    if (e.button === 0) {
      this.snapshot.fireWeapon = true;
    } else if (e.button === 2) {
      this.snapshot.fireLogicalPulse = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this.snapshot.fireWeapon = false;
    }
  }

  public getSnapshot(): InputSnapshot {
    const copy = { ...this.snapshot };
    // Reseta deltas e impulsos de 1 frame
    this.snapshot.deltaMouseX = 0;
    this.snapshot.deltaMouseY = 0;
    this.snapshot.cycleRegister = false;
    this.snapshot.interact = false;
    this.snapshot.toggleCodex = false;
    this.snapshot.fireLogicalPulse = false;
    return copy;
  }

  public isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  public requestPointerLock(): void {
    this.canvas?.requestPointerLock();
  }

  public exitPointerLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  public reset(): void {
    this.snapshot = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      deltaMouseX: 0,
      deltaMouseY: 0,
      fireWeapon: false,
      fireLogicalPulse: false,
      cycleRegister: false,
      interact: false,
      toggleCodex: false,
    };
  }
}
