import {
  Engine,
  Scene,
  UniversalCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Color3,
  Mesh,
} from '@babylonjs/core';
import { IRenderPort, RenderEntityState } from '@app/ports/IRenderPort';
import { ProceduralPixelAssetAdapter } from '../assets/ProceduralPixelAssetAdapter';

/**
 * Adaptador de renderização 3D utilizando Babylon.js (WebGL2).
 * Constrói as salas modulares, projeta a câmera FPS e sincroniza sprites 2D em billboard (RF-18, RNF-01).
 */
export class BabylonRenderAdapter implements IRenderPort {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private camera: UniversalCamera | null = null;
  private levelMeshes: Mesh[] = [];
  private entityMeshes: Map<number, Mesh> = new Map();
  private wallMaterial: StandardMaterial | null = null;
  private floorMaterial: StandardMaterial | null = null;
  private doorMaterial: StandardMaterial | null = null;
  private bitlingTexture: Texture | null = null;
  private overflowTexture: Texture | null = null;

  public async init(canvas: HTMLCanvasElement): Promise<void> {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = Color3.FromHexString('#101820').toColor4(1.0);

    // Câmera FPS vinculada ao jogador
    this.camera = new UniversalCamera('fpsCamera', new Vector3(0, 1.2, 0), this.scene);
    this.camera.fov = 1.1; // ~63 graus
    this.camera.minZ = 0.1;
    this.camera.maxZ = 100.0;

    // Iluminação Sci-Fi
    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.75;
    hemiLight.diffuse = Color3.FromHexString('#39FF88');
    hemiLight.groundColor = Color3.FromHexString('#00D9FF');

    this.initMaterials();
  }

  private initMaterials(): void {
    if (!this.scene) return;

    // Material de Paredes
    this.wallMaterial = new StandardMaterial('wallMat', this.scene);
    const wallTex = Texture.CreateFromBase64String(
      ProceduralPixelAssetAdapter.createWallTexture(),
      'wallTex',
      this.scene
    );
    wallTex.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
    this.wallMaterial.diffuseTexture = wallTex;
    this.wallMaterial.specularColor = new Color3(0, 0, 0);

    // Material de Pisos
    this.floorMaterial = new StandardMaterial('floorMat', this.scene);
    const floorTex = Texture.CreateFromBase64String(
      ProceduralPixelAssetAdapter.createFloorTexture(),
      'floorTex',
      this.scene
    );
    floorTex.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
    this.floorMaterial.diffuseTexture = floorTex;
    this.floorMaterial.specularColor = new Color3(0, 0, 0);

    // Material de Portas
    this.doorMaterial = new StandardMaterial('doorMat', this.scene);
    const doorTex = Texture.CreateFromBase64String(
      ProceduralPixelAssetAdapter.createDoorTexture(),
      'doorTex',
      this.scene
    );
    doorTex.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
    this.doorMaterial.diffuseTexture = doorTex;

    // Texturas de Inimigos (Billboards)
    this.bitlingTexture = Texture.CreateFromBase64String(
      ProceduralPixelAssetAdapter.createBitlingSprite(),
      'bitlingTex',
      this.scene
    );
    this.bitlingTexture.hasAlpha = true;
    this.bitlingTexture.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);

    this.overflowTexture = Texture.CreateFromBase64String(
      ProceduralPixelAssetAdapter.createOverflowSprite(),
      'overflowTex',
      this.scene
    );
    this.overflowTexture.hasAlpha = true;
    this.overflowTexture.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
  }

  public buildLevel(grid: number[][], width: number, height: number): void {
    if (!this.scene) return;

    // Limpa malhas anteriores do nível
    this.levelMeshes.forEach((m) => m.dispose());
    this.levelMeshes = [];

    // Piso e Teto
    const floor = MeshBuilder.CreateGround(
      'floor',
      { width, height: height, subdivisions: 1 },
      this.scene
    );
    floor.position = new Vector3(width / 2, 0, height / 2);
    floor.material = this.floorMaterial;
    this.levelMeshes.push(floor);

    const ceiling = MeshBuilder.CreatePlane('ceiling', { width, height: height }, this.scene);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position = new Vector3(width / 2, 2.5, height / 2);
    ceiling.material = this.floorMaterial;
    this.levelMeshes.push(ceiling);

    // Paredes do grid
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        if (grid[z]?.[x] === 1) {
          // Parede sólida
          const wall = MeshBuilder.CreateBox(
            `wall_${x}_${z}`,
            { width: 1, height: 2.5, depth: 1 },
            this.scene
          );
          wall.position = new Vector3(x + 0.5, 1.25, z + 0.5);
          wall.material = this.wallMaterial;
          this.levelMeshes.push(wall);
        }
      }
    }
  }

  public syncEntities(entities: RenderEntityState[]): void {
    if (!this.scene) return;

    const currentIds = new Set<number>();

    for (const ent of entities) {
      currentIds.add(ent.id);

      if (ent.type === 'PLAYER') {
        if (this.camera) {
          this.camera.position.x = ent.x;
          this.camera.position.y = 1.2;
          this.camera.position.z = ent.z;
          this.camera.rotation.y = ent.yaw;
          this.camera.rotation.x = ent.pitch;
        }
        continue;
      }

      let mesh = this.entityMeshes.get(ent.id);

      if (!mesh) {
        if (ent.type === 'BITLING') {
          mesh = MeshBuilder.CreatePlane(`bitling_${ent.id}`, { size: 1.0 }, this.scene);
          mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
          const mat = new StandardMaterial(`bitlingMat_${ent.id}`, this.scene);
          mat.diffuseTexture = this.bitlingTexture;
          mat.useAlphaFromDiffuseTexture = true;
          mesh.material = mat;
        } else if (ent.type === 'OVERFLOW') {
          mesh = MeshBuilder.CreatePlane(`overflow_${ent.id}`, { size: 1.6 }, this.scene);
          mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
          const mat = new StandardMaterial(`overflowMat_${ent.id}`, this.scene);
          mat.diffuseTexture = this.overflowTexture;
          mat.useAlphaFromDiffuseTexture = true;
          mesh.material = mat;
        } else if (ent.type === 'DOOR') {
          mesh = MeshBuilder.CreateBox(
            `door_${ent.id}`,
            { width: 2.0, height: 2.5, depth: 0.3 },
            this.scene
          );
          mesh.material = this.doorMaterial;
        } else {
          // Terminais, Pickups
          mesh = MeshBuilder.CreateBox(`obj_${ent.id}`, { size: 0.5 }, this.scene);
          const mat = new StandardMaterial(`objMat_${ent.id}`, this.scene);
          mat.diffuseColor = Color3.FromHexString('#00D9FF');
          mesh.material = mat;
        }

        this.entityMeshes.set(ent.id, mesh);
      }

      // Atualiza posição do mesh
      if (ent.type === 'DOOR' && ent.slideProgress !== undefined) {
        // Desliza verticalmente ou lateralmente
        mesh.position.x = ent.x;
        mesh.position.y = 1.25 + ent.slideProgress * 2.5; // Desliza para o teto
        mesh.position.z = ent.z;
      } else {
        mesh.position.x = ent.x;
        mesh.position.y = ent.y;
        mesh.position.z = ent.z;
      }
    }

    // Remove malhas de entidades destruídas
    for (const [id, mesh] of this.entityMeshes) {
      if (!currentIds.has(id)) {
        mesh.dispose();
        this.entityMeshes.delete(id);
      }
    }
  }

  public render(): void {
    this.scene?.render();
  }

  public triggerMuzzleFlash(): void {
    // Efeito de iluminação rápida
  }

  public triggerImpactFlash(x: number, y: number, z: number): void {
    if (!this.scene) return;
    const impact = MeshBuilder.CreatePlane('impact', { size: 0.4 }, this.scene);
    impact.position = new Vector3(x, y, z);
    impact.billboardMode = Mesh.BILLBOARDMODE_ALL;
    const mat = new StandardMaterial('impactMat', this.scene);
    mat.emissiveColor = Color3.FromHexString('#39FF88');
    impact.material = mat;

    setTimeout(() => {
      impact.dispose();
    }, 80);
  }

  public triggerPlayerDamageFlash(): void {
    // Comunica com HUD
  }

  public reset(): void {
    this.entityMeshes.forEach((m) => m.dispose());
    this.entityMeshes.clear();
  }

  public dispose(): void {
    this.scene?.dispose();
    this.engine?.dispose();
  }
}
