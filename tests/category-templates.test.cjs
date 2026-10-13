const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'qr-category-tests-'));
(async()=>{
try {
  for (const file of fs.readdirSync(path.join(root, 'app/lib')).filter(f => f.endsWith('.ts'))) {
    const source = fs.readFileSync(path.join(root, 'app/lib', file), 'utf8');
    const result = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true}});
    fs.writeFileSync(path.join(scratch, file.replace(/\.ts$/, '.js')), result.outputText);
  }
  process.env.NODE_PATH = [path.join(root, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
  Module._initPaths();
  const {categoryTemplates, templateFiles, templateDesign, renderQR} = require(path.join(scratch, 'qr-design.js'));
  const {loadCategoryTemplate}=require(path.join(scratch,'category-template-presets.js'));
  global.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'public',url),'utf8'))});
  assert.deepEqual(categoryTemplates.Hot, Array.from({length: 21}, (_, i) => i));
  const selected = new Set();
  for (const category of ['New', 'Social', 'WiFi', 'Event', 'Love']) {
    assert.equal(categoryTemplates[category].length, 21);
    assert.equal(categoryTemplates[category][0], 0);
    for (const index of categoryTemplates[category].slice(1)) {
      assert(!selected.has(index)); selected.add(index);
      assert(fs.existsSync(path.join(root, 'public/assets/svg', templateFiles[index])));
      await loadCategoryTemplate(index);
      const design = {...templateDesign(index), caption: '<Custom & caption>', logoText: 'Brand'};
      const first = renderQR('https://example.com/first', design, 1000);
      const second = renderQR('https://example.com/second', design, 1000);
      assert.notEqual(first, second);
      assert(!first.includes('__DYNAMIC_QR__'));
      assert(first.includes('width="1000"'));
      assert(first.includes('&lt;Custom &amp; caption&gt;'));
      assert(first.includes('Brand'));
    }
  }
  assert.equal(selected.size, 100);
  console.log('PASS: 100 category templates, unique SVG icons, live payloads, caption/logo rendering, and original Hot mapping.');
} finally { fs.rmSync(scratch, {recursive: true, force: true}); }

})().catch(error=>{console.error(error);process.exitCode=1;});
