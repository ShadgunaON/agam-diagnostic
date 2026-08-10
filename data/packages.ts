export interface PackageItem {
  slug: string;
  title: string;
  category: string;
  description: string;
  price: string;
  icon: string;
  includedTests?: string[];
}

export interface FeaturedPackage {
  slug: string;
  title: string;
  badgeText: string;
  badgeColor: string; // 'purple', 'green', 'blue', 'orange'
  benefit: string;
  highlightIcon: string;
  highlightText: string;
  price: string;
  ageGroups?: string[];
  includedTests?: string[];
}

export interface PackageDetailData {
  slug: string;
  category: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  includes: string[];
  whoShouldGet: string;
  preparation: string;
  relatedPackages: Array<{ title: string; category: string; description: string; slug: string }>;
  highlights: string[];
  includedTests?: string[];
}

export const packagesData = {
  hero: {
    title: "Choose the Right Health Package for Every Stage of Life",
    description: "From routine wellness checkups to specialized diagnostic panels — find the package designed for your age, gender, and health goals. NABL-accredited, doctor-recommended.",
    image: "/images/hero_lab_visual.png",
    pill: "Preventive Healthcare"
  },
  benefits: [
    { title: "Early Detection", description: "Catch health risks before symptoms appear. Early diagnosis significantly improves treatment outcomes.", icon: "target" },
    { title: "Prevention Over Cure", description: "Routine screening helps you manage risk factors before they escalate into serious conditions.", icon: "shield" },
    { title: "Annual Screening", description: "Medical experts recommend comprehensive health checkups at least once a year after age 30.", icon: "calendar" },
    { title: "Long-Term Wellness", description: "Track your health metrics over time. Personalized baselines help you make informed decisions.", icon: "activity" }
  ],
  process: [
    { title: "1. Choose Category", description: "Select Women's Health, Men's Health, or Lifestyle packages based on your needs." },
    { title: "2. Select Package", description: "Compare packages and choose the screening level that's right for you." },
    { title: "3. Book Appointment", description: "Walk in to our lab or schedule a free home sample collection at your convenience." },
    { title: "4. Receive Reports", description: "Get accurate, NABL-certified reports delivered online within 12–24 hours." }
  ],
  featured: [
    {
      slug: "safe-basic-health-package",
      title: "SAFE Basic Health Package",
      badgeText: "Basic",
      badgeColor: "blue",
      benefit: "Key Parameters: CBC, Blood Sugar, Lipid Profile, Liver & Kidney Function",
      highlightIcon: "activity",
      highlightText: "No. of Tests - 45+",
      price: "999",
      ageGroups: ["20-30", "30-50"],
      includedTests: ["cbc", "fbs", "lipid-profile", "lft", "kft"]
    },
    {
      slug: "safe-master-health-checkup-package",
      title: "SAFE Master Health Checkup Package",
      badgeText: "Comprehensive",
      badgeColor: "green",
      benefit: "Key Parameters: CBC, Diabetes, Lipid, Thyroid, Liver, Kidney, Vitamins, Urine Complete",
      highlightIcon: "activity",
      highlightText: "No. of Tests - 85+",
      price: "2,499",
      ageGroups: ["30-50", "50+"],
      includedTests: ["cbc", "fbs", "hba1c", "lipid-profile", "tft", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-executive-health-package",
      title: "SAFE Executive Health Package",
      badgeText: "Executive",
      badgeColor: "purple",
      benefit: "Key Parameters: Master Health + Cardiac Risk Markers + HbA1c + Vitamin D & B12",
      highlightIcon: "male",
      highlightText: "No. of Tests - 95+",
      price: "3,999",
      ageGroups: ["30-50", "50+"],
      includedTests: ["cbc", "fbs", "hba1c", "lipid-profile", "tft", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-women-wellness-package",
      title: "SAFE Women Wellness Package",
      badgeText: "Women's Health",
      badgeColor: "purple",
      benefit: "Key Parameters: Hormone Profile, PCOS Screening, Thyroid, Bone Health, Cancer Markers",
      highlightIcon: "female",
      highlightText: "No. of Tests - 95+",
      price: "2,999",
      ageGroups: ["20-30", "30-50", "50+"],
      includedTests: ["tft"]
    },
    {
      slug: "safe-senior-citizen-health-package",
      title: "SAFE Senior Citizen Health Package",
      badgeText: "Senior Care",
      badgeColor: "orange",
      benefit: "Key Parameters: Full Body + Arthritis Markers + Prostate (for men) + Osteoporosis Screening",
      highlightIcon: "activity",
      highlightText: "No. of Tests - 90+",
      price: "3,499",
      ageGroups: ["50+"],
      includedTests: ["cbc", "fbs", "lipid-profile", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-diabetic-health-package",
      title: "SAFE Diabetic Health Package",
      badgeText: "Specialized",
      badgeColor: "blue",
      benefit: "Key Parameters: HbA1c, Microalbumin, Lipid, Kidney Function, Eye & Nerve Risk Assessment",
      highlightIcon: "activity",
      highlightText: "No. of Tests - 65+",
      price: "1,999",
      ageGroups: ["30-50", "50+"],
      includedTests: ["fbs", "hba1c", "lipid-profile", "kft"]
    },
    {
      slug: "safe-advanced-cardiac-package",
      title: "SAFE Advanced Cardiac Package",
      badgeText: "Specialized",
      badgeColor: "orange",
      benefit: "Key Parameters: Cardiac Enzymes, hs-CRP, Homocysteine, Lipid Profile, ECG Recommendation",
      highlightIcon: "heart",
      highlightText: "No. of Tests - 70+",
      price: "2,799",
      ageGroups: ["30-50", "50+"],
      includedTests: ["lipid-profile"]
    }
  ] as FeaturedPackage[],
  catalog: [
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
      price: "2,499",
      icon: "activity",
      includedTests: ["cbc", "fbs", "hba1c", "lipid-profile", "tft", "lft", "kft", "urine-complete"]
    },
    {
      slug: "safe-women-wellness-package",
      title: "SAFE Women Wellness Package",
      category: "Women's Health",
      description: "Key Parameters: Hormone Profile, PCOS Screening, Thyroid, Bone Health, Cancer Markers",
      price: "2,999",
      icon: "female",
      includedTests: ["tft"]
    }
  ] as PackageItem[]
};

export const packageDetailMock: PackageDetailData = {
  slug: "lipid-profile-test",
  category: "Health Package",
  title: "Lipid Profile Test",
  description: "A comprehensive lipid screening that measures cholesterol levels, triglycerides, HDL, LDL, and VLDL to assess your cardiovascular health risk.",
  price: "1999",
  icon: "❤️",
  includes: [
    "Total Cholesterol",
    "HDL Cholesterol (Good Cholesterol)",
    "LDL Cholesterol (Bad Cholesterol)",
    "VLDL Cholesterol",
    "Triglycerides",
    "Total Cholesterol / HDL Ratio",
    "LDL / HDL Ratio"
  ],
  whoShouldGet: "Anyone above the age of 20 should get a lipid profile done at least once every 5 years. If you have a family history of heart disease, diabetes, or high blood pressure, more frequent testing is recommended.",
  preparation: "Fasting for 9-12 hours is required before the test. You can drink water during the fasting period. Avoid alcohol for at least 24 hours before the test.",
  relatedPackages: [
    { title: "Liver Function Test (LFT)", category: "Essential", description: "Monitor liver health and detect infections.", slug: "lft" },
    { title: "Kidney Function Test", category: "Recommended", description: "Assess kidney health and function.", slug: "kft" }
  ],
  highlights: [
    "7 Parameters Tested",
    "Reports in 12-24 hrs",
    "Free Home Collection",
    "NABL Accredited"
  ],
  includedTests: []
};

export const getPackageBySlug = (slug: string): PackageDetailData | null => {
  const catalogPkg = packagesData.catalog.find(p => p.slug === slug);
  const featuredPkg = packagesData.featured.find(p => p.slug === slug);
  
  const realTests = catalogPkg?.includedTests || featuredPkg?.includedTests || [];
  
  return { 
    ...packageDetailMock, 
    slug, 
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    includedTests: realTests
  };
};
