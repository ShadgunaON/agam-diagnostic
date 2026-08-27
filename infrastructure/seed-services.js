'use strict';

const serviceRepo = require('./src/repositories/dynamo-service');

const CATEGORY_LABELS = {
  'Diagnostics': 'Diagnostics',
  'Research': 'Research',
};

const CATALOG = [
    {
      slug: "clinical-biochemistry",
      title: "Clinical Biochemistry",
      category: "Diagnostics",
      description: "Accurate analysis of blood and body fluids to evaluate organ function, detect diseases, and monitor overall health through advanced biochemical testing.",
      price: "400",
      icon: "microscope",
      color: "blue"
    },
    {
      slug: "haematology",
      title: "Haematology",
      category: "Diagnostics",
      description: "Comprehensive testing of blood components to diagnose conditions like anemia, infections, clotting disorders, and blood-related diseases with precision.",
      price: "300",
      icon: "microscope",
      color: "red"
    },
    {
      slug: "immunology",
      title: "Immunology",
      category: "Diagnostics",
      description: "Advanced testing to assess immune system function, detect allergies, autoimmune disorders, infections, and monitor conditions like HIV and thyroid imbalances.",
      price: "800",
      icon: "immunology",
      color: "purple"
    },
    {
      slug: "clinical-microbiology",
      title: "Clinical Microbiology",
      category: "Diagnostics",
      description: "Identification of bacteria, viruses, fungi, and parasites to diagnose infectious diseases and guide effective treatment through culture and sensitivity testing.",
      price: "500",
      icon: "microbiology",
      color: "green"
    },
    {
      slug: "clinical-histopathology",
      title: "Clinical Histopathology",
      category: "Diagnostics",
      description: "Microscopic examination of tissues to detect abnormalities, cancers, and disease progression, supporting accurate diagnosis and treatment planning.",
      price: "1000",
      icon: "microscope",
      color: "orange"
    },
    {
      slug: "rt-pcr",
      title: "RT-PCR Testing",
      category: "Diagnostics",
      description: "Real-Time Polymerase Chain Reaction (RT-PCR) is the gold standard molecular technique used to detect and quantify specific DNA or RNA sequences.",
      price: "1200",
      icon: "rt-pcr",
      color: "blue"
    },
    {
      slug: "molecular-biology",
      title: "Molecular Biology",
      category: "Research",
      description: "Cutting-edge diagnostic testing using DNA and RNA analysis to detect infections, genetic conditions, and support personalized medicine.",
      price: "2500",
      icon: "dna",
      color: "purple"
    },
    {
      slug: "medical-genetics",
      title: "Medical Genetics",
      category: "Research",
      description: "Advanced genetic testing to identify inherited disorders, assess disease risks, and provide insights for preventive and personalized healthcare.",
      price: "4500",
      icon: "dna",
      color: "green"
    },
    {
      slug: "research-services",
      title: "Research Services",
      category: "Research",
      description: "We offer a wide range of advanced molecular, genetic, and research-based tests.",
      price: "0",
      icon: "microscope",
      color: "orange"
    }
];

const HERO = {
    title: "Our Premium Services",
    description: "Our mission is to provide the highest standard of clinical laboratory service to physicians, clinics, hospitals, and health care providers.",
    image: "/images/services_hero_new.png"
};

async function seed() {
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'agam-data-dev';
  console.log(`\n🌱  Seeding Services catalog → table: ${tableName}`);
  console.log(`    ${CATALOG.length} items to upsert\n`);

  console.log('  → Upserting hero config...');
  await serviceRepo.upsertHeroData(HERO);
  console.log('  ✅ Hero config upserted\n');

  let successCount = 0;
  for (const item of CATALOG) {
    const enriched = {
      ...item,
      id: `service-${item.slug}`,
      categoryLabel: CATEGORY_LABELS[item.category] || item.category,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    try {
      await serviceRepo.upsert(enriched);
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

  console.log('\n✅  Services catalog seed complete.\n');
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
