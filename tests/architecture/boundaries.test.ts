import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Teste arquitetural automatizado (Clean Architecture Enforcer).
 * Garante que módulos de src/domain/ e src/ecs/ sejam estritamente desacoplados
 * de tecnologias externas (Babylon.js, DOM, APIs de janela ou camadas superiores).
 */
describe('Clean Architecture — Boundary Enforcer', () => {
  const rootSrc = path.resolve(__dirname, '../../src');
  const domainDir = path.resolve(rootSrc, 'domain');
  const ecsDir = path.resolve(rootSrc, 'ecs');

  const FORBIDDEN_TOKENS = [
    '@babylonjs',
    'babylonjs',
    'src/infrastructure',
    'src/presentation',
    '@infra',
    '@presentation',
    'window.',
    'document.',
    'localStorage',
    'sessionStorage',
    'HTMLElement',
    'HTMLCanvasElement',
  ];

  function getAllTsFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getAllTsFiles(fullPath));
      } else if (entry.isFile() && fullPath.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it('camada de domínio (src/domain) não deve importar nem referenciar dependências externas ou DOM', () => {
    const domainFiles = getAllTsFiles(domainDir);
    expect(domainFiles.length).toBeGreaterThan(0);

    const violations: { file: string; token: string }[] = [];

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const token of FORBIDDEN_TOKENS) {
        if (content.includes(token)) {
          violations.push({ file: path.relative(rootSrc, file), token });
        }
      }
    }

    expect(
      violations,
      `Violações de fronteira encontradas em src/domain:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });

  it('camada ECS (src/ecs) não deve importar bibliotecas de renderização gráfica diretamente', () => {
    const ecsFiles = getAllTsFiles(ecsDir);
    const violations: { file: string; token: string }[] = [];

    for (const file of ecsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const token of ['@babylonjs', 'babylonjs', 'HTMLCanvasElement']) {
        if (content.includes(token)) {
          violations.push({ file: path.relative(rootSrc, file), token });
        }
      }
    }

    expect(
      violations,
      `Violações de fronteira encontradas em src/ecs:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });
});
