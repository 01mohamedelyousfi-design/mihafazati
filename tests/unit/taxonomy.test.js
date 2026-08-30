import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '..', '..', 'js', 'data.js');
let dataCode = readFileSync(dataPath, 'utf8');

dataCode = dataCode.replace('"use strict";', '');
const executionCode = `
${dataCode}
globalThis.TAXONOMY = TAXONOMY;
globalThis.PLATFORM_FICHES = PLATFORM_FICHES;
globalThis.FILES = FILES;
globalThis.sectionTotals = sectionTotals;
globalThis.axisTotals = axisTotals;
`;

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(executionCode, sandbox);

describe('Taxonomy Architecture Contract (الملف التراكمي)', () => {
  it('defines exactly 3 canonical sections', () => {
    assert.equal(sandbox.TAXONOMY.length, 3);
    const ids = Array.from(sandbox.TAXONOMY.map(s => s.id));
    assert.deepEqual(ids, ['tarbawi', 'didaktiki', 'takwini']);
  });

  it('defines all 9 ministerial axes matching disk directories', () => {
    const axesIds = Array.from(sandbox.TAXONOMY.flatMap(s => s.axes.map(a => a.id)));
    assert.equal(axesIds.length, 9);
    assert.deepEqual(axesIds, [
      'tarbawi.tashrii',
      'tarbawi.masar',
      'tarbawi.daftar',
      'didaktiki.takhtit',
      'didaktiki.tadbir',
      'didaktiki.taqwim',
      'takwini.mumarsa',
      'takwini.takwin',
      'takwini.sihha',
    ]);
  });

  it('defines 25 elements across all axes', () => {
    // +2 from splitting didaktiki.taqwim.asalib into tashkhisi/takwini/jazai
    const elementIds = Array.from(sandbox.TAXONOMY.flatMap(s => s.axes.flatMap(a => a.elements.map(e => e.id))));
    assert.equal(elementIds.length, 25);
    // Verify new taqwim sub-elements exist
    assert.ok(elementIds.includes('didaktiki.taqwim.tashkhisi'), 'tashkhisi element must exist');
    assert.ok(elementIds.includes('didaktiki.taqwim.takwini'),   'takwini element must exist');
    assert.ok(elementIds.includes('didaktiki.taqwim.jazai'),     'jazai element must exist');
    assert.ok(!elementIds.includes('didaktiki.taqwim.asalib'),   'old asalib element must be gone');
  });

  it('contains 206 canonical platform fiches from the master archive', () => {
    assert.equal(sandbox.PLATFORM_FICHES.length, 206);
    for (const f of sandbox.PLATFORM_FICHES) {
      assert.ok(f.id, 'Fiche must have an id');
      assert.ok(f.element_id, 'Fiche must have an element_id');
      assert.ok(f.name, 'Fiche must have a filename');
      assert.ok(f.file_path, 'Fiche must have a file_path');
    }
  });

  it('computes totals correctly for all sections', () => {
    for (let i = 0; i < sandbox.TAXONOMY.length; i++) {
      const totals = sandbox.sectionTotals(i);
      assert.ok(totals.total > 0, `Section ${i} total slots must be > 0`);
      assert.ok(totals.platformCount >= 0, `Section ${i} platformCount must be >= 0`);
    }
  });
});
