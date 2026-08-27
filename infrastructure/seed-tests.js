/**
 * Seed script: populate the Tests catalog in DynamoDB.
 *
 * Source: the canonical static data previously used by MockTestRepository.
 * Target: the real DynamoDB table (agam-data-dev by default).
 *
 * Idempotency: uses PutCommand unconditionally — re-running overwrites with
 * the same data (slug-stable IDs ensure no duplicates).
 *
 * Usage:
 *   node infrastructure/seed-tests.js
 *   DYNAMODB_TABLE_NAME=agam-data-dev node infrastructure/seed-tests.js
 *
 * Requires:
 *   AWS credentials configured in environment / ~/.aws/credentials
 *   Region: us-east-1 (or set AWS_DEFAULT_REGION)
 */

'use strict';

const testRepo = require('./src/repositories/dynamo-test');

// ----------------------------------------------------------------
// Source data — mirrors data/tests.ts in the frontend
// categoryLabel maps category IDs to human-readable labels for
// the frontend categories list.
// ----------------------------------------------------------------
const CATEGORY_LABELS = {
  blood: 'Blood Tests',
  organ: 'Organ Profiles',
  molecular: 'Molecular',
  genetics: 'Genetic Tests',
};

const CATALOG = [
  {
    slug: 'fbs',
    title: 'Fasting Blood Sugar (FBS)',
    category: 'blood',
    tag: 'Blood Test',
    description:
      'Measures blood sugar levels to diagnose diabetes, prediabetes, and monitor treatment. One of the most important routine health tests. Normal Range: Fasting: 70–100 mg/dL | Post Prandial: <140 mg/dL',
    price: '150',
    whoShouldGet:
      'Anyone above 30 years for routine screening, individuals with a family history of diabetes, obesity, or symptoms like excessive thirst and frequent urination.',
    preparation: 'Strict fasting for 8-10 hours is required. Only water is permitted.',
    turnaroundTime: 'Same day within 6 hours',
    faqs: [
      { question: 'Can I drink water before the FBS test?', answer: 'Yes, plain water is allowed. Avoid tea, coffee, or any other beverages.' },
      { question: 'What is the normal range?', answer: 'Normal fasting blood sugar is between 70–100 mg/dL.' },
    ],
    relatedTests: [
      { title: 'HbA1c', category: 'Blood Test', description: 'Average blood sugar control over 3 months.', slug: 'hba1c' },
      { title: 'Lipid Profile', category: 'Heart Health', description: 'Complete cholesterol panel.', slug: 'lipid-profile' },
    ],
  },
  {
    slug: 'hba1c',
    title: 'HbA1c (Glycated Hemoglobin)',
    category: 'blood',
    tag: 'Blood Test',
    description:
      'Gold standard test showing average blood sugar control over 2–3 months. Essential for diabetes diagnosis and long-term monitoring. Normal: <5.7% | Prediabetes: 5.7–6.4% | Diabetes: ≥6.5%',
    price: '450',
    whoShouldGet: 'Diabetics, pre-diabetics, and anyone wanting long-term blood sugar monitoring.',
    preparation: 'No special preparation required. Can be done at any time of day.',
    turnaroundTime: 'Same day within 8 hours',
    faqs: [
      { question: 'Do I need to fast for HbA1c?', answer: 'No fasting is required for HbA1c.' },
      { question: 'How often should I test?', answer: 'Every 3 months for diabetics, or as advised by your doctor.' },
    ],
    relatedTests: [
      { title: 'Fasting Blood Sugar', category: 'Blood Test', description: 'Measures blood sugar levels.', slug: 'fbs' },
    ],
  },
  {
    slug: 'lipid-profile',
    title: 'Lipid Profile Test',
    category: 'blood',
    tag: 'Heart Health',
    description:
      'Complete cholesterol panel (Total, HDL, LDL, VLDL, Triglycerides) to evaluate heart disease and stroke risk.',
    price: '600',
    whoShouldGet: 'Adults over 20, individuals with family history of heart disease, obesity, or hypertension.',
    preparation: 'Fasting for 10-12 hours required.',
    turnaroundTime: 'Same day within 6 hours',
    faqs: [
      { question: 'What does the lipid profile measure?', answer: 'Total cholesterol, HDL, LDL, VLDL, and triglycerides.' },
    ],
    relatedTests: [
      { title: 'Fasting Blood Sugar', category: 'Blood Test', description: 'Measures blood sugar levels.', slug: 'fbs' },
    ],
  },
  {
    slug: 'lft',
    title: 'Liver Function Test (LFT)',
    category: 'organ',
    tag: 'Liver',
    description:
      'Evaluates liver health and detects liver damage, hepatitis, cirrhosis, or effects of medications/alcohol.',
    price: '700',
    whoShouldGet: 'Anyone with symptoms of liver problems, heavy alcohol use, or taking hepatotoxic medications.',
    preparation: 'Fasting for 8 hours recommended.',
    turnaroundTime: 'Same day within 8 hours',
    faqs: [
      { question: 'What does LFT measure?', answer: 'ALT, AST, ALP, bilirubin, albumin, and total protein.' },
    ],
    relatedTests: [
      { title: 'Renal Function Test', category: 'Kidney', description: 'Assesses kidney function.', slug: 'kft' },
    ],
  },
  {
    slug: 'kft',
    title: 'Renal Function Test (KFT)',
    category: 'organ',
    tag: 'Kidney',
    description: 'Assesses kidney function and helps detect early kidney disease or damage.',
    price: '650',
    whoShouldGet: 'Individuals with hypertension, diabetes, or family history of kidney disease.',
    preparation: 'Fasting for 8 hours required.',
    turnaroundTime: 'Same day within 8 hours',
    faqs: [
      { question: 'What does KFT measure?', answer: 'Creatinine, urea, uric acid, and electrolytes.' },
    ],
    relatedTests: [
      { title: 'Urine Complete Analysis', category: 'Urine Test', description: 'Detects urinary disorders.', slug: 'urine-complete' },
    ],
  },
  {
    slug: 'tft',
    title: 'TFT (Thyroid Function Test)',
    category: 'organ',
    tag: 'Thyroid',
    description: 'Diagnoses hypo or hyperthyroidism and helps monitor thyroid treatment.',
    price: '800',
    whoShouldGet: 'Individuals with unexplained weight changes, fatigue, hair loss, or those on thyroid medications.',
    preparation: 'No special preparation required.',
    turnaroundTime: 'Same day within 8 hours',
    faqs: [
      { question: 'What does TFT measure?', answer: 'TSH, T3, and T4 hormone levels.' },
    ],
    relatedTests: [],
  },
  {
    slug: 'cbc',
    title: 'CBC (Complete Blood Count)',
    category: 'blood',
    tag: 'Blood Test',
    description:
      'Evaluates overall health, detects anemia, infections, inflammation, and blood disorders.',
    price: '400',
    whoShouldGet: 'Routine health screening for all ages.',
    preparation: 'No fasting required.',
    turnaroundTime: 'Same day within 4 hours',
    faqs: [
      { question: 'What does CBC measure?', answer: 'RBC, WBC, hemoglobin, hematocrit, and platelets.' },
    ],
    relatedTests: [],
  },
  {
    slug: 'urine-complete',
    title: 'Urine Complete Analysis',
    category: 'blood',
    tag: 'Urine Test',
    description:
      'Detects urinary tract infections, kidney problems, diabetes, and other metabolic disorders.',
    price: '300',
    whoShouldGet: 'Anyone with urinary symptoms or for routine health checks.',
    preparation: 'Collect mid-stream urine sample in the morning.',
    turnaroundTime: 'Same day within 4 hours',
    faqs: [
      { question: 'Do I need to fast?', answer: 'No fasting required. First morning urine sample is preferred.' },
    ],
    relatedTests: [
      { title: 'Renal Function Test', category: 'Kidney', description: 'Assesses kidney function.', slug: 'kft' },
    ],
  },
  {
    slug: 'brca1-brca2',
    title: 'BRCA1 & BRCA2 Mutation Analysis',
    category: 'genetics',
    tag: 'Genetic Test',
    description:
      'Comprehensive screening for mutations in BRCA1 and BRCA2 genes associated with hereditary breast and ovarian cancer.',
    price: '15000',
    whoShouldGet: 'Women with family history of breast or ovarian cancer, BRCA-positive relatives.',
    preparation: 'No special preparation. Blood or saliva sample required.',
    turnaroundTime: '10–14 working days',
    faqs: [
      { question: 'Is this test covered by insurance?', answer: 'Coverage varies; consult your insurer.' },
      { question: 'What if I test positive?', answer: 'A genetic counsellor will help you understand the implications and options.' },
    ],
    relatedTests: [
      { title: 'SMA Carrier Screening', category: 'Genetic Test', description: 'Screens for SMA carriers.', slug: 'sma-carrier' },
    ],
  },
  {
    slug: 'sma-carrier',
    title: 'SMA Carrier Screening',
    category: 'genetics',
    tag: 'Genetic Test',
    description: 'Screens for carriers of Spinal Muscular Atrophy to assess reproductive risk.',
    price: '8000',
    whoShouldGet: 'Couples planning a family, particularly if there is a family history of SMA.',
    preparation: 'No special preparation. Blood sample required.',
    turnaroundTime: '7–10 working days',
    faqs: [
      { question: 'What does carrier mean?', answer: 'A carrier has one defective gene copy but usually shows no symptoms.' },
    ],
    relatedTests: [],
  },
  {
    slug: 'whole-exome-sequencing',
    title: 'Whole Exome Sequencing (WES)',
    category: 'genetics',
    tag: 'Genetic Test',
    description:
      'Advanced genetic test that sequences all protein-coding regions to identify rare genetic disorders.',
    price: '35000',
    whoShouldGet: 'Individuals with undiagnosed rare diseases, developmental delays, or suspected genetic conditions.',
    preparation: 'No special preparation. Blood sample required.',
    turnaroundTime: '21–28 working days',
    faqs: [
      { question: 'What does WES detect?', answer: 'Mutations in the ~20,000 protein-coding genes that make up ~1–2% of the genome.' },
    ],
    relatedTests: [
      { title: 'BRCA1 & BRCA2 Mutation Analysis', category: 'Genetic Test', description: 'Hereditary cancer risk.', slug: 'brca1-brca2' },
    ],
  },
];

const HERO = {
  title: 'Health Tests',
  description:
    'Book reliable blood tests and health checkups. NABL-accredited results with free home collection across Madurai.',
  image: '/images/hero_lab_visual.png',
};

// ----------------------------------------------------------------
// Seed execution
// ----------------------------------------------------------------
async function seed() {
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';
  console.log(`\n🌱  Seeding Tests catalog → table: ${tableName}`);
  console.log(`    ${CATALOG.length} items to upsert\n`);

  // Hero config
  console.log('  → Upserting hero config...');
  await testRepo.upsertHeroData(HERO);
  console.log('  ✅ Hero config upserted\n');

  // Catalog items
  let successCount = 0;
  for (const item of CATALOG) {
    const enriched = {
      ...item,
      id: `test-${item.slug}`,                      // Stable, slug-derived ID
      categoryLabel: CATEGORY_LABELS[item.category] || item.category,
      createdAt: '2025-01-01T00:00:00.000Z',        // Fixed createdAt for deterministic GSI1SK ordering
    };
    try {
      await testRepo.upsert(enriched);
      console.log(`  ✅ ${item.slug}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ ${item.slug}: ${err.message}`);
    }
  }

  console.log(`\n  ${successCount}/${CATALOG.length} items seeded successfully.`);
  if (successCount < CATALOG.length) {
    console.error('  ⚠️  Some items failed to seed. Check errors above.');
    process.exit(1);
  }

  console.log('\n✅  Tests catalog seed complete.\n');
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
