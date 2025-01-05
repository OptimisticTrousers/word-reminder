import { parse, Parser } from "csv-parse";
import { Readable } from "stream";
import { finished } from "stream/promises";

export class Csv {
  private removeDuplicates(record: string[]): string[] {
    const set = new Set<string>();
    for (let i = 0; i < record.length; i++) {
      const word: string = record[i];
      if (word !== "") {
        set.add(word);
      }
    }
    return Array.from(set);
  }

  // Read and process the CSV file
  async read(buffer: Buffer): Promise<{
    records: string[][];
    error: unknown;
    count: number;
  }> {
    const records: string[][] = [];
    const parser: Parser = Readable.from(buffer).pipe(
      parse({
        delimiter: ",",
        relax_column_count: true, // Relax column count to avoid errors with varying columns
        skip_empty_lines: true, // Skip any empty lines in the file
        trim: true, // Automatically trim values
      })
    );

    let count = 0;

    parser.on("readable", () => {
      let record: string[];
      while ((record = parser.read()) !== null) {
        // Work with each record
        const trimmedRecord: string[] = this.removeDuplicates(record);
        count += trimmedRecord.length;
        records.push(trimmedRecord);
      }
    });

    try {
      await finished(parser);
    } catch (error) {
      return { records, error, count };
    }

    return { records, error: null, count };
  }
}
