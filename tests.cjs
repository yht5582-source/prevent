// node tests.cjs — PREVENT engine vs preventr 0.12.1 reference values (tests-reference.json)
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/prevent_simulatorSDI.html', 'utf8');
const src = html.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const m = { exports: {} };
new Function('module', src)(m);
const P = m.exports;
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL', msg); } };
const r3 = v => Math.round(v * 1000 + 1e-9) / 1000;

// 1. reference cases (random, all five models, 10 + 30 yr)
const cases = JSON.parse(fs.readFileSync(__dirname + '/tests-reference.json', 'utf8'));
const models = {};
for (const c of cases) {
  const x = { ...c, uacr: c.uacr ?? null, hba1c: c.hba1c ?? null, sdi: c.sdi ?? null };
  const res = P.compute(x);
  ok(res.ok, 'valid ' + JSON.stringify(c));
  ok(res.model === c.model, `model ${res.model} vs ${c.model}`);
  models[c.model] = (models[c.model] || 0) + 1;
  for (const o of ['total_cvd', 'ascvd', 'heart_failure']) {
    ok(Math.abs(r3(res.r10[o]) - c.r10[o]) <= 0.001, `10yr ${o} ${r3(res.r10[o])} vs ${c.r10[o]} ${JSON.stringify(c)}`);
    ok(Math.abs(r3(res.r30[o]) - c.r30[o]) <= 0.001, `30yr ${o} ${r3(res.r30[o])} vs ${c.r30[o]}`);
  }
}
console.log('reference cases by model:', models);

// 2. published example (preventr README / AHA): 10-yr base total CVD 14.7%, ASCVD 9.2%, HF 8.1%
const ex = { sex: 'female', age: 50, total_c: 200, hdl_c: 45, sbp: 160, bp_tx: true, statin: false, dm: true, smoking: false, egfr: 90, bmi: 35 };
const e = P.compute(ex);
ok(e.model === 'base' && r3(e.r10.total_cvd) === 0.147 && r3(e.r10.ascvd) === 0.092 && r3(e.r10.heart_failure) === 0.081, 'README example ' + JSON.stringify(e.r10));

// 3. validation
ok(!P.compute({ ...ex, age: 29 }).ok, 'age 29 rejected');
ok(!P.compute({ ...ex, sbp: 181 }).ok, 'sbp 181 rejected');
ok(!P.compute({ ...ex, bmi: 18.4 }).ok, 'bmi 18.4 rejected');
ok(!P.compute({ ...ex, hba1c: 16 }).ok, 'hba1c 16 rejected');
ok(P.compute({ ...ex, age: 79 }).ok && P.compute({ ...ex, age: 79 }).r30Questionable, 'age 79 ok, 30yr questionable');

// 4. SDI monotone and model switching
const rows = P.sdiCompare(ex);
ok(rows[0].r10 < rows[1].r10 && rows[1].r10 < rows[2].r10, 'SDI groups monotone');
ok(P.selectModel({ sdi: 5 }) === 'sdi' && P.selectModel({ sdi: 5, uacr: 10 }) === 'full' && P.selectModel({}) === 'base', 'selectModel');
ok(P.sdiGroup(3) === '1-3' && P.sdiGroup(4) === '4-6' && P.sdiGroup(7) === '7-10' && P.sdiGroup(null) === 'unk', 'sdiGroup');

// 5. CKD-EPI 2021 (preventr calc_egfr): female 50 y Cr 1.0 → 69; male 60 y Cr 1.2 → 69
ok(P.ckdEpi2021(1.0, 50, 'female') === 69, 'ckd-epi F ' + P.ckdEpi2021(1.0, 50, 'female'));
ok(P.ckdEpi2021(1.2, 60, 'male') === 69, 'ckd-epi M ' + P.ckdEpi2021(1.2, 60, 'male'));

// 6. KDIGO + CKM
ok(P.kdigo(85, 10).risk === 'none', 'G2A1 none');
ok(P.kdigo(85, 50).risk === 'moderate', 'G2A2 moderate');
ok(P.kdigo(50, 400).risk === 'veryhigh', 'G3aA3 very high');
ok(P.kdigo(35, null).risk === 'high' && P.kdigo(35, null).floor, 'G3b unknown A floor high');
ok(P.kdigo(25, 5).risk === 'veryhigh', 'G4 very high');
const base0 = { sex: 'female', age: 40, total_c: 180, hdl_c: 60, sbp: 112, bmi: 21, egfr: 100, dm: false, bp_tx: false, smoking: false, statin: false, asian: true };
ok(P.ckmStage(base0, 0.01).stage === 0, 'stage 0');
ok(P.ckmStage({ ...base0, bmi: 23.5 }, 0.01).stage === 1, 'stage 1 Asian BMI 23.5');
ok(P.ckmStage({ ...base0, bmi: 23.5, asian: false }, 0.01).stage === 0, 'non-Asian BMI 23.5 stage 0');
ok(P.ckmStage({ ...base0, hba1c: 6.0 }, 0.01).stage === 1, 'prediabetes stage 1');
ok(P.ckmStage({ ...base0, egfr: 80 }, 0.01).stage === 0, 'eGFR 80 alone is not CKD (old bug)');
ok(P.ckmStage({ ...base0, sbp: 132 }, 0.01).stage === 2, 'SBP 132 stage 2');
ok(P.ckmStage({ ...base0, tg: 140 }, 0.01).stage === 2, 'TG 140 stage 2');
ok(P.ckmStage({ ...base0, uacr: 40 }, 0.01).stage === 2, 'A2 stage 2');
ok(P.ckmStage({ ...base0, egfr: 40, uacr: 400 }, 0.01).stage === 3, 'very-high CKD stage 3');
ok(P.ckmStage({ ...base0, sbp: 150 }, 0.21).stage === 3, 'PREVENT >=20% stage 3');
ok(P.ckmStage({ ...base0, subcvd: true }, 0.01).stage === 3, 'subclinical stage 3');
ok(P.ckmStage({ ...base0, cvd: true }, 0.01).stage === 4, 'clinical CVD stage 4');
ok(P.metabolicSyndrome({ ...base0, sex: 'male', waist: 95, tg: 160, hdl_c: 38 }).met, 'MetS 3/5');

// 7. categories
ok(P.ascvdCat(0.029) === 'low' && P.ascvdCat(0.03) === 'borderline' && P.ascvdCat(0.05) === 'intermediate' && P.ascvdCat(0.1) === 'high', 'ASCVD 2026 tiers');
ok(P.totalCat(0.049) === 'low' && P.totalCat(0.074) === 'borderline' && P.totalCat(0.19) === 'intermediate' && P.totalCat(0.2) === 'high', 'total CVD tiers');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
