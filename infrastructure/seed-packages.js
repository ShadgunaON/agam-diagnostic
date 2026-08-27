'use strict';

const packageRepo = require('./src/repositories/dynamo-package');

const CATEGORY_LABELS = {
  'Health Package': 'Health Packages',
  "Women's Health": "Women's Health",
};

const CATALOG = [
    {
      slug: "safe-basic-health-package",
      title: "SAFE Basic Health Package",
      category: "Health Package",
      description: "Key Parameters: CBC, Blood Sugar, Lipid Profile, Liver & Kidney Function",
      price: "999",
      icon: "activity",
      includedTests: ["cbc", "fbs", "lipid-profile", "lft", "kft"]
    },
    {
      slug: "safe-master-health-checkup-package",
      title: "SAFE Master Health Checkup Package",
      category: "Health Package",
      description: "Key Parameters: CBC, Diabetes, Lipid, Thyroid, Liver, Kidney, Vitamins, Urine Complete",
      price: "2499",
      icon: "activity",
      includedTests: ["cbc", "fbs", "hba1c", "lipid-profile", "tft", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-executive-health-package",
      title: "SAFE Executive Health Package",
      category: "Health Package",
      description: "Key Parameters: Master Health + Cardiac Risk Markers + HbA1c + Vitamin D & B12",
      price: "3999",
      icon: "male",
      includedTests: ["cbc", "fbs", "hba1c", "lipid-profile", "tft", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-women-wellness-package",
      title: "SAFE Women Wellness Package",
      category: "Women's Health",
      description: "Key Parameters: Hormone Profile, PCOS Screening, Thyroid, Bone Health, Cancer Markers",
      price: "2999",
      icon: "female",
      includedTests: ["tft"]
    },
    {
      slug: "safe-senior-citizen-health-package",
      title: "SAFE Senior Citizen Health Package",
      category: "Health Package",
      description: "Key Parameters: Full Body + Arthritis Markers + Prostate (for men) + Osteoporosis Screening",
      price: "3499",
      icon: "activity",
      includedTests: ["cbc", "fbs", "lipid-profile", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-diabetic-health-package",
      title: "SAFE Diabetic Health Package",
      category: "Health Package",
      description: "Key Parameters: HbA1c, Microalbumin, Lipid, Kidney Function, Eye & Nerve Risk Assessment",
      price: "1999",
      icon: "activity",
      includedTests: ["fbs", "hba1c", "lipid-profile", "kft"]
    },
    {
      slug: "safe-advanced-cardiac-package",
      title: "SAFE Advanced Cardiac Package",
      category: "Health Package",
      description: "Key Parameters: Cardiac Enzymes, hs-CRP, Homocysteine, Lipid Profile, ECG Recommendation",
      price: "2799",
      icon: "heart",
      includedTests: ["lipid-profile"]
    }
];

const FEATURED = [
  "safe-basic-health-package",
  "safe-master-health-checkup-package",
  "safe-executive-health-package",
  "safe-women-wellness-package",
  "safe-senior-citizen-health-package",
  "safe-diabetic-health-package",
  "safe-advanced-cardiac-package"
];

const HERO = {
    title: "Choose the Right Health Package for Every Stage of Life",
    description: "From routine wellness checkups to specialized diagnostic panels — find the package designed for your age, gender, and health goals. NABL-accredited, doctor-recommended.",
    image: "/images/hero_lab_visual.png",
    pill: "Preventive Healthcare"
};

const BENEFITS = [
    { title: "Early Detection", description: "Catch health risks before symptoms appear. Early diagnosis significantly improves treatment outcomes.", icon: "target" },
    { title: "Prevention Over Cure", description: "Routine screening helps you manage risk factors before they escalate into serious conditions.", icon: "shield" },
    { title: "Annual Screening", description: "Medical experts recommend comprehensive health checkups at least once a year after age 30.", icon: "calendar" },
    { title: "Long-Term Wellness", description: "Track your health metrics over time. Personalized baselines help you make informed decisions.", icon: "activity" }
];

const PROCESS_STEPS = [
    { title: "1. Choose Category", description: "Select Women's Health, Men's Health, or Lifestyle packages based on your needs." },
    { title: "2. Select Package", description: "Compare packages and choose the screening level that's right for you." },
    { title: "3. Book Appointment", description: "Walk in to our lab or schedule a free home sample collection at your convenience." },
    { title: "4. Receive Reports", description: "Get accurate, NABL-certified reports delivered online within 12–24 hours." }
];

async function seed() {
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';
  console.log(`\n🌱  Seeding Packages catalog → table: ${tableName}`);
  console.log(`    ${CATALOG.length} items to upsert\n`);

  console.log('  → Upserting hero, benefits, process, featured...');
  await packageRepo.upsertConfig('PACKAGES_HERO', HERO);
  await packageRepo.upsertConfig('PACKAGES_BENEFITS', { benefits: BENEFITS });
  await packageRepo.upsertConfig('PACKAGES_PROCESS', { steps: PROCESS_STEPS });
  await packageRepo.upsertConfig('PACKAGES_FEATURED', { packageIds: FEATURED.map(f => `package-${f}`) });
  console.log('  ✅ Configs upserted\n');

  let successCount = 0;
  for (const item of CATALOG) {
    const enriched = {
      ...item,
      id: `package-${item.slug}`,
      categoryLabel: CATEGORY_LABELS[item.category] || item.category,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    try {
      await packageRepo.upsert(enriched);
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

  console.log('\n✅  Packages catalog seed complete.\n');
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
