const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `const DEFAULT_CONTENT: HealthPackagesPageContent = {
  hero: {
    title: 'Comprehensive Health Packages',
    description: 'Preventive health checkups for you and your family. Full body assessments with specialist consultations included.',
    image: '/images/hero_lab_visual.png',
    imageAlt: 'Health Packages',
    primaryActionLabel: 'Browse Packages',
    primaryActionLink: '#browse-category',
    eyebrow: 'Preventive Care',
    isVisible: true,
  },
  preventiveCare: {
    eyebrow: 'Why It Matters',
    title: 'Preventive Care Saves Lives',
    description: 'Over 70% of chronic diseases are preventable with early detection.',
    isVisible: true,
  },
  benefits: {
    isVisible: true,
    items: [
      { title: 'Complete Assessment', description: 'Comprehensive coverage of all vital health parameters.', icon: 'target' },
      { title: 'Free Consultation', description: 'Expert review of your reports by specialist doctors.', icon: 'shield' },
      { title: 'Home Collection', description: 'Free sample collection from your home at your preferred time.', icon: 'home' },
      { title: 'Smart Reports', description: 'Easy-to-understand digital reports with historical trends.', icon: 'activity' }
    ]
  },
  process: {
    eyebrow: 'How It Works',
    title: '4 Simple Steps to Better Health',
    description: '',
    isVisible: true,
    steps: [
      { title: 'Book Package', description: 'Select a package and schedule your preferred time.' },
      { title: 'Sample Collection', description: 'Our phlebotomist visits your home for sample collection.' },
      { title: 'Lab Processing', description: 'Samples are processed in our NABL accredited lab.' },
      { title: 'Digital Reports', description: 'Receive smart reports via WhatsApp and email.' }
    ]
  },
  category: {
    eyebrow: 'Browse by Category',
    title: 'Find the Right Package for You',
    description: 'Our health packages are organized based on specific needs.',
    isVisible: true,
  },
  featured: {
    eyebrow: 'Most Popular',
    title: 'Featured Health Packages',
    description: 'Our most recommended packages.',
    packageIds: [],
    isVisible: true,
  },
  advantage: {
    eyebrow: 'The AGAM Advantage',
    title: 'Why Choose AGAM Packages',
    description: 'Every package at AGAM Diagnostics is designed with clinical precision, affordable pricing, and patient convenience at its core.',
    isVisible: true,
    items: [
      { title: "NABL Accredited", description: "Every test is processed in our NABL-certified laboratory, ensuring the highest accuracy and international quality standards.", icon: "award" },
      { title: "Free Home Collection", description: "Schedule a sample collection at your doorstep — available across Madurai city with trained phlebotomists.", icon: "home" },
      { title: "Same-Day Reports", description: "Receive your digital reports within 12-24 hours. Specialized tests may take 48 hours with real-time tracking.", icon: "clock" },
      { title: "Expert Pathologists", description: "Every report is reviewed by senior pathologists with 15+ years of clinical experience before it reaches you.", icon: "award" }
    ]
  },
  bottomCta: {
    title: 'Not sure which package is right for you?',
    description: 'Our diagnostic experts can help you choose.',
    primaryActionLabel: 'Book a Free Consultation',
    primaryActionLink: '/contact',
    secondaryActionLabel: 'Call: +91 89408 94079',
    secondaryActionLink: 'tel:+918940894079',
    isVisible: true,
  }
};`;

const targetStart = 'const DEFAULT_CONTENT: HealthPackagesPageContent = {';
const targetEnd = '};';
const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd, startIndex) + targetEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content);
  console.log('Replaced DEFAULT_CONTENT successfully.');
} else {
  console.error('Could not find DEFAULT_CONTENT block');
}
