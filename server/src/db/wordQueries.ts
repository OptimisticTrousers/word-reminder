import { Queries } from "./queries";

export interface Word {
  meanings: Meaning[];
  phonetics: Phonetic[];
  phonetic?: string;
  word: string;
  origin?: string;
}

interface Phonetic {
  text: string;
  audio?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

type DefinitionId = Definition & { meaningId: string };

type MeaningId = Meaning & { wordId: string };

type PhoneticId = Phonetic & { wordId: string };

export class WordQueries extends Queries {
  async createWord({ meanings, phonetics, phonetic, word, origin }: Word) {
    const { rows } = await this.pool.query(
      "INSERT INTO words(word, origin, phonetic) VALUES ($1, $2, $3) RETURNING *",
      [word.toLowerCase(), origin, phonetic]
    );

    const newWord = rows[0];

    for (let i = 0; i < meanings.length; i++) {
      const meaning = meanings[i];

      await this.createMeaning({ wordId: newWord.id, ...meaning });
    }

    for (let i = 0; i < phonetics.length; i++) {
      const phonetic = phonetics[i];

      await this.createPhonetic({
        wordId: newWord.id,
        ...phonetic,
      });
    }

    return newWord;
  }

  async wordExistsByWord(word: string) {
    const existingWord = await this.getWordByWord(word);

    if (existingWord) {
      return true;
    }

    return false;
  }

  async wordExistsById(id: string) {
    const existingWord = await this.getWordById(id);

    if (existingWord) {
      return true;
    }

    return false;
  }

  async getWordByWord(word: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM words WHERE word = $1",
      [word.toLowerCase()]
    );

    const existingWord = rows[0];

    return existingWord;
  }

  async getWordById(id: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM words WHERE id = $1",
      [id]
    );

    const word = rows[0];

    return word;
  }

  async getWordInformation(wordId: string) {
    const { rows } = await this.pool.query(
      `SELECT FROM words 
         JOIN meanings 
          ON meanings.word_id = words.id 
         JOIN definitions 
          ON definitions.meaning_id = meanings.id 
         JOIN phonetics 
          ON phonetics.word_id = words.id 
         WHERE word_id = $1`,
      [wordId]
    );
  }

  private async createMeaning({
    wordId,
    definitions,
    partOfSpeech,
  }: MeaningId) {
    const { rows } = await this.pool.query(
      "INSERT INTO meanings(part_of_speech, word_id) VALUES ($1, $2) RETURNING *",
      [partOfSpeech, wordId]
    );

    const meaning = rows[0];

    for (let i = 0; i < definitions.length; i++) {
      const definition = definitions[i];

      await this.createDefinition({ meaningId: meaning.id, ...definition });
    }
  }

  private async createDefinition({
    meaningId,
    definition,
    example,
    synonyms,
    antonyms,
  }: DefinitionId) {
    const { rows } = await this.pool.query(
      "INSERT INTO definitions(meaning_id, definition, example, synonyms, antonyms) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [meaningId, definition, example, synonyms, antonyms]
    );

    const meaning = rows[0];

    return meaning;
  }

  private async createPhonetic({ audio, text, wordId }: PhoneticId) {
    const { rows } = await this.pool.query(
      "INSERT INTO phonetics(audio, text, word_id) VALUES ($1, $2, $3) RETURNING *",
      [audio, text, wordId]
    );

    const phonetic = rows[0];

    return phonetic;
  }
}
