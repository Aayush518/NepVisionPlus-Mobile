// Nepali phoneme mappings with their ARPABET equivalents
export const consonantMap: { [key: string]: string } = {
  क: 'K',
  ख: 'KH',
  ग: 'G',
  घ: 'GH',
  ङ: 'NG',
  च: 'CH',
  छ: 'CHH',
  ज: 'JH',
  झ: 'JHH',
  ञ: 'NY',
  ट: 'T',
  ठ: 'TH',
  ड: 'D',
  ढ: 'DH',
  ण: 'N',
  त: 'T',
  थ: 'TH',
  द: 'D',
  ध: 'DH',
  न: 'N',
  प: 'P',
  फ: 'F', // Updated for more accurate representation
  ब: 'B',
  भ: 'BH',
  म: 'M',
  य: 'Y',
  र: 'R',
  ल: 'L',
  व: 'W',
  श: 'SH',
  ष: 'SH',
  स: 'S',
  ह: 'HH',
  क्ष: 'K SH',
  त्र: 'T R',
  ज्ञ: 'G Y',
  श्र: 'SH R',
};

export const vowelMap: { [key: string]: string } = {
  अ: 'AH0',
  आ: 'AA1',
  इ: 'IH0',
  ई: 'IY1',
  उ: 'UH0',
  ऊ: 'UW1',
  ऋ: 'R IH0',
  ए: 'EY1',
  ऐ: 'AY1',
  ओ: 'OW1',
  औ: 'AW1',
  'ा': 'AA1',
  'ि': 'IH0',
  'ी': 'IY1',
  'ु': 'UH0',
  'ू': 'UW1',
  'ृ': 'R IH0',
  'े': 'EY1',
  'ै': 'AY1',
  'ो': 'OW1',
  'ौ': 'AW1',
  'ं': 'N',
  'ँ': 'N', // Added nasalization
  'ः': 'HH',
};

// Extended special conjunct rules
export const specialConjuncts: { [key: string]: string } = {
  // R-conjuncts
  क्र: 'K R',
  प्र: 'P R',
  त्र: 'T R',
  श्र: 'SH R',
  ग्र: 'G R',
  द्र: 'D R',
  ब्र: 'B R',
  ख्र: 'KH R',
  झ्र: 'JH R',
  भ्र: 'BH R',
  स्र: 'S R',
  ह्र: 'HH R',

  // L-conjuncts
  क्ल: 'K L',
  प्ल: 'P L',
  ब्ल: 'B L',
  फ्ल: 'F L',
  ग्ल: 'G L',

  // W-conjuncts
  क्व: 'K W',
  त्व: 'T W',
  द्व: 'D W',
  स्व: 'S W',
  ह्व: 'HH W',

  // Y-conjuncts
  क्य: 'K Y',
  प्य: 'P Y',
  त्य: 'T Y',
  द्य: 'D Y',
  न्य: 'N Y',
  म्य: 'M Y',
  य्क: 'Y K',


  // Special combinations
  ज्ञ: 'G Y',
  क्ष: 'K SH',
  श्व: 'SH W',
  ष्ठ: 'SH TH',
  द्ध: 'D DH',
  ट्ट: 'T T',
  द्द: 'D D',
  ल्ल: 'L L',
  ठ्ठ: 'TH T', 
};

// Syllable patterns for weight calculation
export const syllablePatterns = {
  light: ['CV', 'V'],
  heavy: ['CVC', 'CVV', 'VC', 'VV'],
  extraHeavy: ['CVVC', 'CVCC', 'VVC', 'VCC'],
};

// Extended diacritic markers
export const diacritics = [
  '्',
  'ं',
  'ः',
  'ँ',
  'ृ',
  'ा',
  'ि',
  'ी',
  'ु',
  'ू',
  'े',
  'ै',
  'ो',
  'ौ',
  '़',
  '॑',
  '॒',
];

// Special characters and their treatments
export const specialCharacters = {
  '॥': '', // Double danda - treated as sentence break
  '।': '', // Single danda - treated as sentence break
  '॰': '', // Abbreviation marker
  '॑': '', // Vedic accent - high
  '॒': '', // Vedic accent - low
  '़': '', // Nukta
};

// Halant (virama) marker
export const halant = '्';

// Stress assignment rules
export const stressRules = {
  primary: [
    'Assign primary stress (1) to the heaviest syllable closest to the right edge',
    'If no heavy syllables exist, stress the first syllable',
    'In compounds, maintain primary stress of the first component',
  ],
  secondary: [
    'Assign secondary stress (2) to heavy syllables not carrying primary stress',
    'In longer words, alternate secondary stress from primary stress',
    'Maintain at least one unstressed syllable between stresses',
  ],
  exceptions: [
    'Monosyllabic words always receive primary stress',
    'Function words typically remain unstressed',
    'Vocative case receives initial primary stress',
  ],
};

// Phonological rules
export const phonologicalRules = {
  nasalization: [
    'Nasalize vowels before nasal consonants',
    'Preserve nasalization across morpheme boundaries',
  ],
  assimilation: [
    'Voice assimilation in consonant clusters',
    'Place assimilation for nasals before stops',
    'Progressive assimilation in retroflex sequences',
  ],
  deletion: [
    'Schwa deletion in specific environments',
    'Consonant cluster simplification',
    'Word-final schwa deletion',
  ],
  insertion: [
    'Glide insertion between vowels',
    'Schwa insertion to break complex clusters',
    'Gemination in specific environments',
  ],
};
