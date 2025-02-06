import { syllablePatterns } from './nepali-phonemes';

interface Syllable {
  text: string;
  weight: 'light' | 'heavy' | 'superheavy';
  stress: 0 | 1 | 2;
  onset: string[];
  nucleus: string;
  coda: string[];
}

interface StressAnalysis {
  syllables: Syllable[];
  stressPattern: string;
  rules: {
    name: string;
    applied: boolean;
    description: string;
  }[];
}

export class StressAnalyzer {
  private static isVowel(char: string): boolean {
    return /[अआइईउऊऋएऐओऔािीुूृेैोौं]/.test(char);
  }

  private static isConsonant(char: string): boolean {
    return /[कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह]/.test(char);
  }

  private static isHalant(char: string): boolean {
    return char === '्';
  }

  private static getSyllableWeight(syllable: Syllable): 'light' | 'heavy' | 'superheavy' {
    const hasLongVowel = /[आईऊएऐओऔाीूेैोौ]/.test(syllable.nucleus);
    const codaLength = syllable.coda.length;

    if (hasLongVowel && codaLength > 0) {
      return 'superheavy';
    } else if (hasLongVowel || codaLength > 0) {
      return 'heavy';
    }
    return 'light';
  }

  private static segmentIntoSyllables(text: string): Syllable[] {
    const syllables: Syllable[] = [];
    let currentSyllable: Partial<Syllable> = {
      onset: [],
      nucleus: '',
      coda: [],
      text: ''
    };
    
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      
      // Handle consonant clusters
      if (this.isConsonant(char)) {
        if (!currentSyllable.nucleus) {
          currentSyllable.onset!.push(char);
          if (i + 1 < text.length && this.isHalant(text[i + 1])) {
            i += 2;
            continue;
          }
        } else {
          currentSyllable.coda!.push(char);
        }
      }
      // Handle vowels
      else if (this.isVowel(char)) {
        if (!currentSyllable.nucleus) {
          currentSyllable.nucleus = char;
          currentSyllable.text = text.substring(i - currentSyllable.onset!.length, i + 1);
          
          // Complete syllable
          const weight = this.getSyllableWeight(currentSyllable as Syllable);
          syllables.push({
            ...currentSyllable as Syllable,
            weight,
            stress: 0
          });
          
          // Reset for next syllable
          currentSyllable = {
            onset: [],
            nucleus: '',
            coda: [],
            text: ''
          };
        }
      }
      i++;
    }

    // Handle any remaining syllable
    if (currentSyllable.nucleus) {
      const weight = this.getSyllableWeight(currentSyllable as Syllable);
      syllables.push({
        ...currentSyllable as Syllable,
        weight,
        stress: 0
      });
    }

    return syllables;
  }

  private static assignPrimaryStress(syllables: Syllable[]): void {
    // Rule 1: Rightmost heavy/superheavy syllable gets primary stress
    for (let i = syllables.length - 1; i >= 0; i--) {
      if (syllables[i].weight !== 'light') {
        syllables[i].stress = 1;
        return;
      }
    }
    
    // Rule 2: If no heavy syllables, stress first syllable
    if (syllables.length > 0) {
      syllables[0].stress = 1;
    }
  }

  private static assignSecondaryStress(syllables: Syllable[]): void {
    let primaryStressIndex = syllables.findIndex(s => s.stress === 1);
    
    // Assign secondary stress to heavy syllables before primary stress
    for (let i = 0; i < primaryStressIndex; i++) {
      if (syllables[i].weight !== 'light' && i % 2 === 0) {
        syllables[i].stress = 2;
      }
    }
    
    // Assign secondary stress to heavy syllables after primary stress
    for (let i = primaryStressIndex + 2; i < syllables.length; i++) {
      if (syllables[i].weight !== 'light' && (i - primaryStressIndex) % 2 === 0) {
        syllables[i].stress = 2;
      }
    }
  }

  public static analyzeStress(text: string): StressAnalysis {
    const syllables = this.segmentIntoSyllables(text);
    const rules = [
      {
        name: 'Primary Stress Assignment',
        applied: false,
        description: 'Assign primary stress (1) to rightmost heavy syllable or first syllable'
      },
      {
        name: 'Secondary Stress Assignment',
        applied: false,
        description: 'Assign secondary stress (2) to alternating heavy syllables'
      },
      {
        name: 'Word-Final Destressing',
        applied: false,
        description: 'Remove stress from word-final light syllables'
      }
    ];

    // Apply stress rules
    this.assignPrimaryStress(syllables);
    rules[0].applied = true;

    this.assignSecondaryStress(syllables);
    rules[1].applied = true;

    // Word-final destressing
    if (syllables.length > 0 && syllables[syllables.length - 1].weight === 'light') {
      syllables[syllables.length - 1].stress = 0;
      rules[2].applied = true;
    }

    // Generate stress pattern string
    const stressPattern = syllables
      .map(s => s.stress)
      .join('');

    return {
      syllables,
      stressPattern,
      rules
    };
  }
}