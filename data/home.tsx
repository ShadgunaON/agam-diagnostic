import React from 'react';

// Types
export interface HeroData {
  pillText: string;
  titlePart1: string;
  titleSpan: string;
  description: string;
  searchPlaceholder: string;
  features: Array<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }>;
}

export interface StatisticData {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export interface ServiceData {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export interface PackageData {
  title: string;
  category: string;
  description: string;
  price: string;
  isPopular?: boolean;
  features: string[];
}

export interface TestimonialData {
  name: string;
  role: string;
  quote: string;
  imageUrl: string;
}

export interface WhyChooseUsData {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface BlogPreviewData {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl?: string;
  href: string;
}

export interface FAQData {
  question: string;
  answer: string;
}

export interface ContactPreviewData {
  address: string[];
  hours: string[];
  phone: string;
  email: string;
}

// Data Exports
export const heroData: HeroData = {
  pillText: "NABL Accredited / Trusted Diagnostics",
  titlePart1: "Advanced Diagnostics\nYou Can ",
  titleSpan: "Trust",
  description: "Agam Diagnostics is Madurai’s most trusted NABL accredited and ICMR approved fully automated pathology laboratory and diagnostic centre. We offer accurate, affordable and timely diagnostic services including Master Health Checkup Packages, free home sample collection, clinical biochemistry, haematology, immunology, microbiology, histopathology, RT-PCR, advanced molecular biology, medical genetics, and more.",
  searchPlaceholder: "Search for tests (e.g., CBC, Thyroid Profile, Liver Function)",
  features: [
    {
      title: "Home Collection",
      subtitle: "Safe & Convenient",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    },
    {
      title: "Accurate Results",
      subtitle: "NABL Certified",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
    },
    {
      title: "Report in 4-24hrs",
      subtitle: "Digital & Secure",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    }
  ]
};

export const statisticsData: StatisticData[] = [
  {
    value: "250+",
    label: "Advanced Tests",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
  },
  {
    value: "50K+",
    label: "Patients Served",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  },
  {
    value: "15+",
    label: "Expert Pathologists",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  },
  {
    value: "4hr",
    label: "Report Turnaround",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  }
];

export const servicesData: ServiceData[] = [
  {
    title: "Master Health Checkup",
    description: "Comprehensive assessment of your body's overall health.",
    href: "/services",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  },
  {
    title: "Medical Genetics",
    description: "Advanced DNA testing and inherited condition screening.",
    href: "/services",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  },
  {
    title: "Molecular Diagnostics",
    description: "State-of-the-art RT-PCR and molecular pathology testing.",
    href: "/services",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  },
  {
    title: "Clinical Biochemistry",
    description: "Precise metabolic and organ function testing.",
    href: "/services",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
  }
];

export const packagesData: PackageData[] = [
  {
    category: "Preventive Health",
    title: "Basic Health Checkup",
    description: "Essential screening covering 45 vital parameters including CBC, Sugar, Thyroid, and Lipid profile.",
    price: "₹999",
    features: [
      "Complete Blood Count (CBC)",
      "Fasting Blood Sugar",
      "Thyroid Profile (T3, T4, TSH)",
      "Lipid Profile"
    ]
  },
  {
    isPopular: true,
    category: "Specialized Care",
    title: "Advanced Cardiac Care",
    description: "Comprehensive heart health screening designed to evaluate cardiac risks, including ECG and detailed Lipid profile.",
    price: "₹1999",
    features: [
      "ECG",
      "Detailed Lipid Profile",
      "Cardiac Risk Markers",
      "Kidney Function Test"
    ]
  },
  {
    category: "Age Specific",
    title: "Senior Citizen Package",
    description: "Specialized full-body screening tailored for adults over 60, focusing on bone health, diabetes, and organ function.",
    price: "₹2499",
    features: [
      "Bone Mineral Density Test",
      "Liver Function Test",
      "Kidney Function Test",
      "Complete Urine Analysis"
    ]
  }
];

export const testimonialsData: TestimonialData[] = [
  {
    name: "Rajesh Kumar",
    role: "Routine Checkup",
    quote: "Very professional lab with fast results. The home collection service was excellent — the phlebotomist was on time, gentle, and thorough. Got my reports the same day via WhatsApp. I will definitely be recommending this place to my friends and family.",
    imageUrl: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0B1B3D&color=fff"
  },
  {
    name: "Priya Sundaram",
    role: "Genetic Testing",
    quote: "Agam Diagnostics is the best lab I've visited in Madurai. The staff is courteous, the equipment looks modern, and the reports are detailed and accurate. Highly recommended for genetic testing!",
    imageUrl: "https://ui-avatars.com/api/?name=Priya+Sundaram&background=0B1B3D&color=fff"
  },
  {
    name: "Mohammed Farook",
    role: "Master Health Checkup",
    quote: "Affordable and reliable. I got my master health checkup done and the reports were clear and well-explained. The NABL accreditation gives me total confidence in their quality.",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammed+Farook&background=0B1B3D&color=fff"
  }
];

export const whyChooseUsData: WhyChooseUsData[] = [
  {
    title: "NABL Accredited",
    description: "Our laboratory adheres to the highest international standards of quality and competence.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  },
  {
    title: "Advanced Technology",
    description: "Fully automated systems and modern diagnostic equipment for error-free analysis.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  },
  {
    title: "Precision & Accuracy",
    description: "Expert pathologists reviewing every test result to guarantee diagnostic precision.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  }
];

export const blogPreviewData: BlogPreviewData[] = [
  {
    title: "How Lifestyle Impacts Your Health",
    excerpt: "Discover the everyday habits that shape your long-term wellness...",
    date: "Health & Wellness", // Used as category/date in wireframe
    category: "Health & Wellness",
    href: "/blog"
  },
  {
    title: "The Role of Advanced Diagnostics",
    excerpt: "Understand how modern testing prevents major illnesses...",
    date: "Diagnostics",
    category: "Diagnostics",
    href: "/blog"
  },
  {
    title: "Understanding Blood Test Reports",
    excerpt: "Learn how to read and interpret your lab results...",
    date: "Patient Education",
    category: "Patient Education",
    href: "/blog"
  },
  {
    title: "Why Health Checkups Matter",
    excerpt: "The importance of preventive screenings for adults...",
    date: "Preventive Care",
    category: "Preventive Care",
    href: "/blog"
  }
];

export const faqData: FAQData[] = [
  {
    question: "Do you offer home blood sample collection in Madurai?",
    answer: "Yes, Agam Diagnostics provides free, safe, and hygienic home blood sample collection across Madurai. Our trained phlebotomists use advanced techniques like Vein Finders for painless collection. Reports are delivered quickly via email or WhatsApp."
  },
  {
    question: "What types of DNA and genetic tests do you provide?",
    answer: "We are an advanced molecular biology and medical genetics lab. We provide complete genetic testing, including Whole Exome, Clinical Exome, Whole Genome, cancer genetics, Gut Microbiome, NIPT, Fertility, prenatal and neonatal cytogenetic tests, and personalized genomic analysis."
  },
  {
    question: "Is Agam Diagnostics an NABL accredited laboratory?",
    answer: "Yes, Agam Diagnostics is fully NABL accredited and ICMR approved. We utilize a fully automated referral lab system with European-standard equipment to guarantee the highest accuracy and precision for your medical test results."
  },
  {
    question: "Do you perform MRI, X-ray, or ultrasound scans?",
    answer: "No, Agam Diagnostics is a specialized pathology and molecular biology laboratory. We focus exclusively on analyzing blood, urine, bodily fluids, RT-PCR, and DNA/genetic testing to provide the most precise diagnostic data possible."
  },
  {
    question: "How quickly will I receive my blood test reports?",
    answer: "Because our laboratory is fully automated with the latest cutting-edge machinery, we provide highly accurate, same-day reports for the vast majority of our routine blood tests and health checkup packages."
  }
];

export const contactData: ContactPreviewData = {
  address: [
    "Ground Floor, Plot No.17-R-1, 120 Feet Road,",
    "Vivekananda Nagar, Sambakulam,",
    "Madurai, Tamil Nadu - 625007"
  ],
  hours: [
    "Monday - Sunday: 6:30 AM - 9:30 PM"
  ],
  phone: "+91 89408 94079",
  email: "support@agamdiagnostics.com"
};
