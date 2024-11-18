import fs from "fs";
import { parse } from "csv-parse";
import { finished } from "stream/promises";

export class Csv {
  /**
   * Trims CSV records by removing leading and trailing empty values.
   * This helps prevent issues where leading or trailing commas result
   * in empty entries that disrupt the expected structure of the CSV.
   */
  private trimCsvRecord(record: string[]) {
    // Remove empty values from the start and end of the record
    return record.filter((value: string) => value.trim() !== "");
  }

  // Read and process the CSV file
  async read(filePath: string) {
    const records: string[][] = [];
    const parser = fs.createReadStream(filePath).pipe(
      parse({
        delimiter: ",",
        relax_column_count: true, // Relax column count to avoid errors with varying columns
        skip_empty_lines: true, // Skip any empty lines in the file
        trim: true, // Automatically trim values
      })
    );

    parser
      .on("readable", () => {
        let record;
        while ((record = parser.read()) !== null) {
          // Work with each record
          const trimmedRecord = this.trimCsvRecord(record);
          records.push(trimmedRecord);
        }
      })
      .on("error", (error) => {
        return { records, error };
      });

    await finished(parser);

    return { records, error: null };
  }
}
