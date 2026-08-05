export interface ServiceItem {
  slug: string;
  title: string;
  category: string;
  description: string;
  price: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export interface ServiceDetailData {
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  icon: string;
  valueProps: Array<{ title: string; icon: string }>;
  aboutHtml: string;
  whoShouldUse: string[];
  process: Array<{ title: string; description: string }>;
  preparation: { title: string; description: string; icon: string };
  faqs: Array<{ question: string; answer: string }>;
  relatedTests: Array<{ title: string; category: string; description: string; slug: string }>;
  otherServices: Array<{ title: string; slug: string }>;
}

export const servicesData = {
  hero: {
    title: "Our Premium Services",
    description: "Our mission is to provide the highest standard of clinical laboratory service to physicians, clinics, hospitals, and health care providers.",
    image: "/images/services_hero_new.png"
  },
  catalog: [
    {
      slug: "clinical-biochemistry",
      title: "Clinical Biochemistry",
      category: "Diagnostics",
      description: "Accurate analysis of blood and body fluids to evaluate organ function, detect diseases, and monitor overall health through advanced biochemical testing.",
      price: "From ₹400",
      icon: "microscope",
      color: "blue"
    },
    {
      slug: "haematology",
      title: "Haematology",
      category: "Diagnostics",
      description: "Comprehensive testing of blood components to diagnose conditions like anemia, infections, clotting disorders, and blood-related diseases with precision.",
      price: "From ₹300",
      icon: "microscope",
      color: "red"
    },
    {
      slug: "immunology",
      title: "Immunology",
      category: "Diagnostics",
      description: "Advanced testing to assess immune system function, detect allergies, autoimmune disorders, infections, and monitor conditions like HIV and thyroid imbalances.",
      price: "From ₹800",
      icon: "immunology",
      color: "purple"
    },
    {
      slug: "clinical-microbiology",
      title: "Clinical Microbiology",
      category: "Diagnostics",
      description: "Identification of bacteria, viruses, fungi, and parasites to diagnose infectious diseases and guide effective treatment through culture and sensitivity testing.",
      price: "From ₹500",
      icon: "microbiology",
      color: "green"
    },
    {
      slug: "clinical-histopathology",
      title: "Clinical Histopathology",
      category: "Diagnostics",
      description: "Microscopic examination of tissues to detect abnormalities, cancers, and disease progression, supporting accurate diagnosis and treatment planning.",
      price: "From ₹1000",
      icon: "microscope",
      color: "orange"
    },
    {
      slug: "rt-pcr",
      title: "RT-PCR Testing",
      category: "Diagnostics",
      description: "Real-Time Polymerase Chain Reaction (RT-PCR) is the gold standard molecular technique used to detect and quantify specific DNA or RNA sequences.",
      price: "From ₹1200",
      icon: "rt-pcr",
      color: "blue"
    },
    {
      slug: "molecular-biology",
      title: "Molecular Biology",
      category: "Research",
      description: "Cutting-edge diagnostic testing using DNA and RNA analysis to detect infections, genetic conditions, and support personalized medicine.",
      price: "From ₹2500",
      icon: "dna",
      color: "purple"
    },
    {
      slug: "medical-genetics",
      title: "Medical Genetics",
      category: "Research",
      description: "Advanced genetic testing to identify inherited disorders, assess disease risks, and provide insights for preventive and personalized healthcare.",
      price: "From ₹4500",
      icon: "dna",
      color: "green"
    },
    {
      slug: "research-services",
      title: "Research Services",
      category: "Research",
      description: "We offer a wide range of advanced molecular, genetic, and research-based tests.",
      price: "Custom",
      icon: "microscope",
      color: "orange"
    }
  ] as ServiceItem[]
};

export const serviceDetailMock: ServiceDetailData = {
  slug: "master-health-checkup",
  category: "Diagnostic Service",
  title: "Master Health Checkup",
  shortDescription: "Advanced research-grade diagnostics and analytical services for clinical studies, academic research partnerships, and pharmaceutical testing at Agam Diagnostics.",
  icon: "🔬",
  valueProps: [
    { title: "Home Sample Collection", icon: "home" },
    { title: "NABL Accredited Lab", icon: "shield" },
    { title: "Same Day Digital Reports", icon: "clock" },
    { title: "WhatsApp Delivery", icon: "phone" }
  ],
  aboutHtml: `
    <p>Agam Diagnostics provides state-of-the-art research services that support clinical trials, academic research, and pharmaceutical development. Our NABL-accredited and ICMR-approved laboratory ensures the highest standards of precision and quality in all research diagnostics.</p>
    <p>Our facility is equipped with fully automated European-standard equipment, including advanced analyzers, vein finders, and molecular diagnostic instruments that support both routine and specialized testing requirements.</p>
  `,
  whoShouldUse: [
    "Patients requiring accurate diagnostics for infectious diseases",
    "Individuals undergoing routine health screenings",
    "Patients monitoring chronic conditions",
    "Those advised by their physicians for specific biomarker analysis"
  ],
  process: [
    { title: "1. Sample Collection", description: "Visit our lab or book a free home collection slot. Our expert phlebotomists ensure a painless experience." },
    { title: "2. Automated Processing", description: "Samples are processed in our NABL accredited facility using advanced robotics for zero human error." },
    { title: "3. Expert Verification", description: "Senior pathologists and biochemists review the automated results to ensure absolute accuracy." },
    { title: "4. Report Delivery", description: "Receive your secure digital reports via WhatsApp and email on the same day." }
  ],
  preparation: {
    title: "Fasting Requirements",
    description: "Most routine tests require 8-10 hours of fasting. Please drink plenty of water. Consult your doctor or contact our support team for specific test requirements.",
    icon: "warning"
  },
  faqs: [
    { question: "How long does it take to get the reports?", answer: "For most routine and biochemical tests, reports are delivered on the same day within 6-8 hours. Specialized genetic or molecular tests may take 2-4 days." },
    { question: "Is home collection really free?", answer: "Yes, we offer free home sample collection across all areas in Madurai. Simply book a slot online or via WhatsApp." }
  ],
  relatedTests: [
    { title: "Complete Blood Count (CBC)", category: "Blood Test", description: "Comprehensive blood cell analysis for overall health assessment.", slug: "cbc" },
    { title: "Liver Function Test (LFT)", category: "Biochemistry", description: "Assess liver health with comprehensive enzyme and protein testing.", slug: "lft" }
  ],
  otherServices: [
    { title: "Medical Genetics", slug: "medical-genetics" },
    { title: "Molecular Biology", slug: "molecular-biology" },
    { title: "RT-PCR Testing", slug: "rt-pcr" },
    { title: "Clinical Microbiology", slug: "microbiology" },
    { title: "Immunology", slug: "immunology" },
    { title: "Clinical Biochemistry", slug: "biochemistry" },
    { title: "Haematology", slug: "haematology" }
  ]
};

// Mock CMS behavior
export const getServiceBySlug = (slug: string): ServiceDetailData | null => {
  return { ...serviceDetailMock, slug, title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };
};
