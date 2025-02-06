import { dictionaryData } from './dictionary-data';

interface ArpabetDictionary {
  [key: string]: string;
}

export class Dictionary {
  private static instance: Dictionary;
  private dictionary: ArpabetDictionary = {};

  private constructor() {
    // Initialize dictionary from imported data
    this.loadDictionary();
  }

  private loadDictionary() {
    // Load from dictionary-data first
    Object.entries(dictionaryData).forEach(([word, arpabet]) => {
      this.dictionary[word.trim()] = arpabet.trim();
    });

    // Cache the dictionary for better performance
    this.cacheDictionary();
  }

  private cacheDictionary() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nepali-arpabet-dictionary', JSON.stringify(this.dictionary));
    }
  }

  public static getInstance(): Dictionary {
    if (!Dictionary.instance) {
      Dictionary.instance = new Dictionary();
    }
    return Dictionary.instance;
  }

  public lookup(word: string): string | null {
    return this.dictionary[word] || null;
  }

  public addEntry(word: string, arpabet: string): void {
    this.dictionary[word] = arpabet;
    this.cacheDictionary();
  }

  public getSize(): number {
    return Object.keys(this.dictionary).length;
  }
}