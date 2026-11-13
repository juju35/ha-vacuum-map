// Bundles the part of three.js the 3D view uses into frontend/vendor/three.min.js (one ES module, no import).
//   npm install --no-save three@0.187.0 esbuild@0.25 && node scripts/build-three.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const NAMES = [
  'BoxGeometry', 'BufferAttribute', 'BufferGeometry', 'Color', 'CylinderGeometry', 'DirectionalLight', 'DoubleSide',
  'ExtrudeGeometry', 'Group', 'HemisphereLight', 'Line', 'LineBasicMaterial', 'Mesh', 'MeshBasicMaterial',
  'MeshStandardMaterial', 'PCFShadowMap', 'Path', 'PerspectiveCamera', 'RingGeometry', 'SRGBColorSpace', 'Scene',
  'Shape', 'ShapeGeometry', 'Vector3', 'WebGLRenderer',
];
const out = new URL('../custom_components/vacuum_map/frontend/vendor/three.min.js', import.meta.url);
const version = JSON.parse(readFileSync(new URL('../node_modules/three/package.json', import.meta.url))).version;
const result = await build({
  stdin: { contents: `export { ${NAMES.join(', ')} } from 'three';`, resolveDir: new URL('..', import.meta.url).pathname },
  bundle: true,
  minify: true,
  format: 'esm',
  legalComments: 'none',
  write: false,
});
const header = `/* three.js ${version} (https://threejs.org), MIT License, Copyright 2010-2026 three.js authors. Subset bundled by scripts/build-three.mjs. */\n`;
writeFileSync(out, header + result.outputFiles[0].text);
console.log(`three.js ${version}: ${NAMES.length} exports → ${out.pathname}`);
