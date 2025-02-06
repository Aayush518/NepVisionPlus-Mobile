import { consonantMap, vowelMap, diacritics, halant, specialConjuncts, phonologicalRules } from './nepali-phonemes';
import { Dictionary } from './dictionary';
import { StressAnalyzer } from './stress-analyzer';

interface Syllable {
  onset: string[];
  nucleus: string;
  coda: string[];
  weight: 'light' | 'heavy' | 'extraHeavy';
}

interface WordAnalysis {
  segments: {
    original: string;
    type: 'consonant' | 'vowel' | 'conjunct' | 'diacritic';
    arpabet: string;
    stress?: string;
  }[];
  rules: {
    name: string;
    description: string;
    applied: boolean;
  }[];
}

export class NepaliArpabetConverter {
  private syllables: Syllable[] = [];
  private dictionary: Dictionary;
  private analysis: WordAnalysis = { segments: [], rules: [] };

  constructor() {
    this.dictionary = Dictionary.getInstance();
  }

  private isVowel(char: string): boolean {
    return char in vowelMap || Object.keys(vowelMap).some(v => char.includes(v));
  }

  private isConsonant(char: string): boolean {
    return char in consonantMap || Object.keys(consonantMap).some(c => char.includes(c));
  }

  private isDiacritic(char: string): boolean {
    return diacritics.includes(char);
  }

  private handleSpecialConjunct(text: string, startIndex: number): { segment: string, endIndex: number, isWConjunct: boolean } | null {
    for (const [conjunct, arpabet] of Object.entries(specialConjuncts)) {
      if (text.slice(startIndex).startsWith(conjunct)) {
        return {
          segment: conjunct,
          endIndex: startIndex + conjunct.length - 1,
          isWConjunct: arpabet.includes('W')
        };
      }
    }
    return null;
  }

  private handleConjunctConsonants(text: string, startIndex: number): { segment: string, endIndex: number, isWConjunct: boolean } {
    const specialConjunct = this.handleSpecialConjunct(text, startIndex);
    if (specialConjunct) {
      return specialConjunct;
    }

    let segment = text[startIndex];
    let i = startIndex + 1;
    let hasHalant = false;
    let isWConjunct = false;

    while (i < text.length) {
      const char = text[i];
      
      if (char === halant) {
        hasHalant = true;
        segment += char;
        i++;
      } else if (hasHalant && this.isConsonant(char)) {
        segment += char;
        if (char === 'व') {
          isWConjunct = true;
        }
        hasHalant = false;
        i++;
      } else {
        break;
      }
    }

    return { segment, endIndex: i - 1, isWConjunct };
  }

  private segmentWord(text: string): string[] {
    const segments: string[] = [];
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      
      if (this.isConsonant(char)) {
        const { segment, endIndex } = this.handleConjunctConsonants(text, i);
        let fullSegment = segment;
        
        i = endIndex + 1;
        
        if (i < text.length && this.isDiacritic(text[i]) && !text[i].includes(halant)) {
          fullSegment += text[i];
          i++;
        }
        
        segments.push(fullSegment);
      } else if (this.isVowel(char)) {
        segments.push(char);
        i++;
      } else if (this.isDiacritic(char)) {
        if (segments.length > 0) {
          segments[segments.length - 1] += char;
        }
        i++;
      } else {
        i++;
      }
    }

    return segments;
  }

  private convertConjunctToArpabet(conjunct: string, isWConjunct: boolean): string {
    if (conjunct in specialConjuncts) {
      return specialConjuncts[conjunct];
    }

    const parts = conjunct.split(halant);
    let result = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part in consonantMap) {
        result += consonantMap[part];
        if (i < parts.length - 1 || isWConjunct) {
          result += ' ';
        }
      }
    }
    
    if (isWConjunct && !result.includes('W')) {
      result += 'W';
    }
    
    return result;
  }

  private analyzeSyllableWeight(syllable: Syllable): void {
    const hasLongVowel = syllable.nucleus.match(/[ाीूेैोौ]/);
    const hasCoda = syllable.coda.length > 0;
    
    if (hasLongVowel && hasCoda) {
      syllable.weight = 'extraHeavy';
    } else if (hasLongVowel || hasCoda) {
      syllable.weight = 'heavy';
    } else {
      syllable.weight = 'light';
    }
  }

  private assignStress(syllables: Syllable[]): void {
    let primaryStressAssigned = false;
    
    for (let i = syllables.length - 1; i >= 0; i--) {
      const syllable = syllables[i];
      
      if (!primaryStressAssigned && (syllable.weight === 'heavy' || syllable.weight === 'extraHeavy')) {
        syllable.nucleus = syllable.nucleus.replace(/0/, '1');
        primaryStressAssigned = true;
      }
    }
    
    if (!primaryStressAssigned && syllables.length > 0) {
      syllables[0].nucleus = syllables[0].nucleus.replace(/0/, '1');
      primaryStressAssigned = true;
    }
    
    let foundPrimary = false;
    for (let i = 0; i < syllables.length; i++) {
      const syllable = syllables[i];
      
      if (syllable.nucleus.includes('1')) {
        foundPrimary = true;
      } else if (foundPrimary && i % 2 === 0) {
        syllable.nucleus = syllable.nucleus.replace(/0/, '2');
      }
    }
  }

  private applyPhonologicalRules(arpabet: string): string {
    for (const ruleCategory of Object.values(phonologicalRules)) {
      for (const rule of ruleCategory) {
        arpabet = this.applySingleRule(arpabet, rule);
      }
    }
    return arpabet;
  }

  private applySingleRule(arpabet: string, rule: string): string {
    switch (rule) {
      case 'Nasalize vowels before nasal consonants':
        return arpabet.replace(/([AEIOU][HW]?[012])\s+([NMṄ])/g, '$1_N $2');
      case 'Voice assimilation in consonant clusters': {
        const voicelessToVoiced: { [key: string]: string } = {
          'P': 'B', 'T': 'D', 'K': 'G', 'S': 'Z'
        };
        return arpabet.replace(/([PTKS])\s+([BDGZ])/g, (_, p1, p2) => 
          `${voicelessToVoiced[p1] || p1} ${p2}`
        );
      }
      default:
        return arpabet;
    }
  }

  private addAnalysisRule(name: string, description: string, applied: boolean) {
    this.analysis.rules.push({ name, description, applied });
  }

  private addAnalysisSegment(original: string, type: 'consonant' | 'vowel' | 'conjunct' | 'diacritic', arpabet: string, stress?: string) {
    this.analysis.segments.push({ original, type, arpabet, stress });
  }

  public convertToArpabet(text: string): { 
    arpabet: string; 
    source: 'dictionary' | 'rules';
    analysis?: WordAnalysis;
  } {
    // Reset analysis
    this.analysis = { segments: [], rules: [] };

    // Check dictionary first
    const dictionaryResult = this.dictionary.lookup(text);
    if (dictionaryResult) {
      this.addAnalysisRule(
        'Dictionary Lookup',
        'Word found in dictionary, using pre-defined pronunciation',
        true
      );
      return { 
        arpabet: dictionaryResult, 
        source: 'dictionary',
        analysis: this.analysis 
      };
    }

    this.addAnalysisRule(
      'Dictionary Lookup',
      'Word not found in dictionary, applying phonological rules',
      false
    );

    // Analyze stress pattern
    const stressAnalysis = StressAnalyzer.analyzeStress(text);
    
    // Add stress analysis to the main analysis
    stressAnalysis.rules.forEach(rule => {
      this.addAnalysisRule(rule.name, rule.description, rule.applied);
    });

    const segments = this.segmentWord(text);
    let arpabetResult = '';
    
    // Map syllable index to stress value
    const stressMap = new Map(
      stressAnalysis.syllables.map((syl, idx) => [idx, syl.stress])
    );
    
    let currentSyllable = 0;
    
    for (const segment of segments) {
      if (segment.includes(halant)) {
        const { segment: conjunctSegment, isWConjunct } = this.handleConjunctConsonants(segment, 0);
        const conjunctParts = this.convertConjunctToArpabet(conjunctSegment, isWConjunct);
        const vowelPart = segment.match(/[ािीुूृेैोौं]/);
        
        this.addAnalysisSegment(segment, 'conjunct', conjunctParts);
        
        arpabetResult += conjunctParts;
        if (vowelPart) {
          const stress = stressMap.get(currentSyllable) || 0;
          const vowelArpabet = vowelMap[vowelPart[0]].replace(/[012]/, stress.toString());
          this.addAnalysisSegment(vowelPart[0], 'vowel', vowelArpabet, stress.toString());
          arpabetResult += ` ${vowelArpabet} `;
        } else {
          const stress = stressMap.get(currentSyllable) || 0;
          this.addAnalysisSegment('अ', 'vowel', `AH${stress}`, stress.toString());
          arpabetResult += ` AH${stress} `;
        }
        currentSyllable++;
      } else if (this.isConsonant(segment[0])) {
        let consonant = consonantMap[segment[0]] || segment[0];
        let vowel = 'AH0';
        
        this.addAnalysisSegment(segment[0], 'consonant', consonant);
        
        if (segment.length > 1) {
          const vowelChar = segment[1];
          const stress = stressMap.get(currentSyllable) || 0;
          vowel = (vowelMap[vowelChar] || vowel).replace(/[012]/, stress.toString());
          this.addAnalysisSegment(vowelChar, 'vowel', vowel, stress.toString());
        } else {
          const stress = stressMap.get(currentSyllable) || 0;
          vowel = `AH${stress}`;
          this.addAnalysisSegment('अ', 'vowel', vowel, stress.toString());
        }
        
        arpabetResult += `${consonant} ${vowel} `;
        currentSyllable++;
      } else if (this.isVowel(segment)) {
        const stress = stressMap.get(currentSyllable) || 0;
        const vowelArpabet = (vowelMap[segment] || segment).replace(/[012]/, stress.toString());
        this.addAnalysisSegment(segment, 'vowel', vowelArpabet, stress.toString());
        arpabetResult += `${vowelArpabet} `;
        currentSyllable++;
      }
    }
    
    // Apply phonological rules
    const beforeRules = arpabetResult.trim();
    arpabetResult = this.applyPhonologicalRules(arpabetResult.trim());
    
    if (beforeRules !== arpabetResult) {
      this.addAnalysisRule(
        'Phonological Rules',
        'Applied phonological rules for natural pronunciation',
        true
      );
    }
    
    return { 
      arpabet: arpabetResult, 
      source: 'rules',
      analysis: this.analysis 
    };
  }
}

export const convertToArpabet = (text: string): { 
  arpabet: string; 
  source: 'dictionary' | 'rules';
  analysis?: WordAnalysis;
} => {
  const converter = new NepaliArpabetConverter();
  return converter.convertToArpabet(text);
};

export const convertFileToArpabet = async (file: File): Promise<Array<{nepali: string, arpabet: string}>> => {
  const converter = new NepaliArpabetConverter();
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const result = converter.convertToArpabet(line.trim());
    return {
      nepali: line.trim(),
      arpabet: result.arpabet
    };
  });
};