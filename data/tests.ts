export interface TestItem {
  slug: string;
  title: string;
  category: string;
  tag: string;
  description: string;
}

export const testsData = {
  hero: {
    title: "Health Tests",
    description: "Book reliable blood tests and health checkups. NABL-accredited results with free home collection across Madurai.",
    image: "/images/hero_lab_visual.png"
  },
  categories: [
    { id: "all", label: "All Tests" },
    { id: "blood", label: "Blood Tests" },
    { id: "organ", label: "Organ Profiles" },
    { id: "molecular", label: "Molecular" }
  ],
  catalog: [
    {
      slug: "fbs",
      title: "Fasting Blood Sugar (FBS)",
      category: "blood",
      tag: "Blood Test",
      description: "Measures blood sugar levels to diagnose diabetes, prediabetes, and monitor treatment. One of the most important routine health tests. Normal Range: Fasting: 70–100 mg/dL | Post Prandial: <140 mg/dL"
    },
    {
      slug: "hba1c",
      title: "HbA1c (Glycated Hemoglobin)",
      category: "blood",
      tag: "Blood Test",
      description: "Gold standard test showing average blood sugar control over 2–3 months. Essential for diabetes diagnosis and long-term monitoring. Normal: <5.7% | Prediabetes: 5.7–6.4% | Diabetes: ≥6.5%"
    },
    {
      slug: "lipid-profile",
      title: "Lipid Profile Test",
      category: "blood",
      tag: "Heart Health",
      description: "Complete cholesterol panel (Total, HDL, LDL, VLDL, Triglycerides) to evaluate heart disease and stroke risk."
    },
    {
      slug: "lft",
      title: "Liver Function Test (LFT)",
      category: "organ",
      tag: "Liver",
      description: "Evaluates liver health and detects liver damage, hepatitis, cirrhosis, or effects of medications/alcohol."
    },
    {
      slug: "kft",
      title: "Renal Function Test (KFT)",
      category: "organ",
      tag: "Kidney",
      description: "Assesses kidney function and helps detect early kidney disease or damage."
    },
    {
      slug: "tft",
      title: "TFT (Thyroid Function Test)",
      category: "organ",
      tag: "Thyroid",
      description: "Diagnoses hypo or hyperthyroidism and helps monitor thyroid treatment."
    },
    {
      slug: "cbc",
      title: "CBC (Complete Blood Count)",
      category: "blood",
      tag: "Blood Test",
      description: "Evaluates overall health, detects anemia, infections, inflammation, and blood disorders."
    },
    {
      slug: "urine-complete",
      title: "Urine Complete Analysis",
      category: "blood",
      tag: "Urine Test",
      description: "Detects urinary tract infections, kidney problems, diabetes, and other metabolic disorders."
    }
  ] as TestItem[]
};

export interface TestDetailData {
  slug: string;
  category: string;
  title: string;
  description: string;
  price: string;
  tag: string;
  whoShouldGet: string;
  preparation: string;
  turnaroundTime: string;
  faqs: Array<{ question: string; answer: string }>;
  relatedTests: Array<{ title: string; category: string; description: string; slug: string }>;
}

export const testDetailMock: TestDetailData = {
  slug: "fbs",
  category: "Blood Test",
  title: "Fasting Blood Sugar (FBS)",
  description: "Measures blood sugar levels to diagnose diabetes, prediabetes, and monitor treatment. One of the most important routine health tests.",
  price: "150",
  tag: "Blood Test",
  whoShouldGet: "Anyone above 30 years for routine screening, individuals with a family history of diabetes, obesity, or symptoms like excessive thirst and frequent urination.",
  preparation: "Strict fasting for 8-10 hours is required. Only water is permitted.",
  turnaroundTime: "Same day within 6 hours",
  faqs: [
    { question: "Can I drink water before the FBS test?", answer: "Yes, plain water is allowed. Avoid tea, coffee, or any other beverages." },
    { question: "What is the normal range?", answer: "Normal fasting blood sugar is between 70–100 mg/dL." }
  ],
  relatedTests: [
    { title: "HbA1c", category: "Blood Test", description: "Average blood sugar control over 3 months.", slug: "hba1c" },
    { title: "Lipid Profile", category: "Heart Health", description: "Complete cholesterol panel.", slug: "lipid-profile" }
  ]
};

export const getTestBySlug = (slug: string): TestDetailData | null => {
  return { ...testDetailMock, slug, title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };
};
