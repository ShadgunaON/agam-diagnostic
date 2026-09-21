const fs = require('fs');
const path = require('path');

const filesToFix = [
  'components/sections/contact/ContactContentSection.tsx',
  'components/sections/services/ServicesCatalogSection.tsx',
  'components/sections/about/AgamDifferenceSection.tsx',
  'components/sections/about/CoreValuesSection.tsx',
  'components/sections/about/TrustBarSection.tsx'
];

const replacementIconCode = `  const getIcon = (iconNameStr?: string) => {
    if (!iconNameStr) return <LucideIcons.CheckCircle className="w-6 h-6" />;
    
    const legacyMap: Record<string, string> = {
      'award': 'Award', 'clock': 'Clock', 'home': 'Home', 'phone': 'Phone',
      'target': 'Target', 'shield': 'Shield', 'calendar': 'Calendar', 'activity': 'Activity',
      'checkup': 'Activity', 'dna': 'Dna', 'genetics': 'Dna', 'microscope': 'Microscope',
      'molecular': 'Microscope', 'rt-pcr': 'TestTube', 'pcr': 'TestTube', 'flask': 'FlaskConical',
      'beaker': 'Beaker', 'heart': 'Heart', 'brain': 'Brain', 'bone': 'Bone', 'lungs': 'Wind',
      'liver': 'Activity', 'kidney': 'Activity', 'stomach': 'Activity', 'blood': 'Droplet',
      'primary': 'Star', 'secondary': 'CheckCircle', 'accent': 'Award', 'blue': 'Shield',
      'phone-call': 'PhoneCall', 'mail': 'Mail', 'map-pin': 'MapPin'
    };
    
    const mappedName = legacyMap[iconNameStr] || iconNameStr;
    const toPascalCase = (str: string) => str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
    const IconComponent = (LucideIcons as any)[toPascalCase(mappedName)] || LucideIcons.CheckCircle;
    return <IconComponent className="w-6 h-6" strokeWidth={2} />;
  };`;

function replaceGetIcon(content) {
  const getIconIndex = content.indexOf('const getIcon =');
  if (getIconIndex === -1) return content;
  
  // Find the end of the getIcon block
  let braceCount = 0;
  let startedBraces = false;
  let endIndex = -1;
  
  for (let i = getIconIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      startedBraces = true;
    } else if (content[i] === '}') {
      braceCount--;
    }
    
    if (startedBraces && braceCount === 0) {
      endIndex = i;
      // also check for trailing semicolon
      if (content[i+1] === ';') {
        endIndex++;
      }
      break;
    }
  }
  
  if (endIndex !== -1) {
    return content.substring(0, getIconIndex) + replacementIconCode + content.substring(endIndex + 1);
  }
  return content;
}

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes('import * as LucideIcons from \'lucide-react\';')) {
    content = content.replace(/import React(.*?)\n/, "import React$1\nimport * as LucideIcons from 'lucide-react';\n");
  }
  
  content = replaceGetIcon(content);
  
  // Also fix usages if they pass variables named \`name\` or \`variant\` instead of \`iconName\`
  // but since we named the arg \`iconNameStr\` inside getIcon, it doesn't matter what the caller passes!
  // Wait, if the caller passes `item.variant`, it's just an argument. The parameter name `iconNameStr` is used inside getIcon, so it's perfectly safe.
  
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', relPath);
});
